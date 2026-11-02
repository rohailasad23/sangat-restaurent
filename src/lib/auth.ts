import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "./db";
import { AdminUserModel } from "./models";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./session";

export async function getAdmin(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  await connectDB();
  const exists = await AdminUserModel.exists({ _id: session.sub });
  return exists ? session : null;
}

/** For API route handlers: returns a 401 response when not signed in. */
export async function requireAdmin(): Promise<SessionPayload | NextResponse> {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return admin;
  } catch {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }
}

export function isResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}
