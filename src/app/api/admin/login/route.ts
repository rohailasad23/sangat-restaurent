import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB, hasDatabase } from "@/lib/db";
import { AdminUserModel, logActivity } from "@/lib/models";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";

// Compared against when the email is unknown, so response timing does not reveal which emails exist.
let dummyHash: string | null = null;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("not-a-real-password", 12));

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const rl = rateLimit(`login:${ip}`, 8, 15 * 60_000);
  if (!rl.ok) return NextResponse.json({ error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfter / 60)} minutes.` }, { status: 429 });
  if (!hasDatabase() || !process.env.AUTH_SECRET) return NextResponse.json({ error: "Admin is not configured on this server." }, { status: 503 });

  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });

  await connectDB();
  const user = await AdminUserModel.findOne({ email: parsed.data.email }).select("+passwordHash");
  const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? getDummyHash());
  if (!user || !ok) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

  user.lastLoginAt = new Date();
  await user.save();
  await logActivity("admin.login", user.email);

  const token = await signSession({ sub: String(user._id), email: user.email });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
