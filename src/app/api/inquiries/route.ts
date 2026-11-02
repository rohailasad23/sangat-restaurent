import { NextResponse } from "next/server";
import { connectDB, hasDatabase } from "@/lib/db";
import { InquiryModel, logActivity } from "@/lib/models";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { fieldErrors, inquirySchema } from "@/lib/validation";

export async function POST(req: Request) {
  const rl = rateLimit(`inq:${clientIp(req.headers)}`, 5, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });

  const parsed = inquirySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) }, { status: 400 });
  const { website, ...data } = parsed.data;
  if (website) return NextResponse.json({ ok: true });
  if (!hasDatabase()) return NextResponse.json({ error: "Messages are temporarily unavailable. Please call us." }, { status: 503 });

  try {
    await connectDB();
    await InquiryModel.create({ ...data, guests: data.guests ?? null });
    await logActivity(data.kind === "group" ? "inquiry.group" : "inquiry.contact", data.name);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[inquiries]", err);
    return NextResponse.json({ error: "We couldn't send your message. Please call us." }, { status: 500 });
  }
}
