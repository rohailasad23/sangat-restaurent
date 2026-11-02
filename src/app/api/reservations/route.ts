import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { connectDB, hasDatabase } from "@/lib/db";
import { logActivity, ReservationModel } from "@/lib/models";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fieldErrors, reservationSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const rl = rateLimit(`res:${ip}`, 5, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Please try again in a few minutes or call us." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  const body = await req.json().catch(() => null);
  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) }, { status: 400 });
  const { website, ...data } = parsed.data;
  if (website) return NextResponse.json({ ok: true, reference: "RECEIVED" }); // honeypot: silently accept bots

  if (!hasDatabase()) return NextResponse.json({ error: "Online reservations are temporarily unavailable. Please call or WhatsApp us." }, { status: 503 });

  // One open request per phone number + date + time prevents accidental double submissions.
  const dedupeKey = createHash("sha256").update(`${data.phone.replace(/\D/g, "")}|${data.date}|${data.time}`).digest("hex");
  try {
    await connectDB();
    const existing = await ReservationModel.findOne({ dedupeKey });
    if (existing && (existing.status === "pending" || existing.status === "confirmed")) {
      return NextResponse.json({ ok: true, duplicate: true, reference: String(existing._id).slice(-6).toUpperCase() });
    }
    const doc = existing
      ? await ReservationModel.findByIdAndUpdate(existing._id, { ...data, status: "pending" }, { new: true })
      : await ReservationModel.create({ ...data, dedupeKey });
    const reference = String(doc!._id).slice(-6).toUpperCase();
    await logActivity("reservation.created", `${data.name}, ${data.guests} guests, ${data.date} ${data.time}`);
    return NextResponse.json({ ok: true, reference }, { status: 201 });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) return NextResponse.json({ ok: true, duplicate: true });
    console.error("[reservations]", err);
    return NextResponse.json({ error: "We couldn't save your request. Please call or WhatsApp us." }, { status: 500 });
  }
}
