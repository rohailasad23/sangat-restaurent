/**
 * Creates or resets an admin account. There is deliberately no public sign-up page.
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='long password' npm run create-admin
 */
import "./env";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { AdminUserModel } from "../src/lib/models";

export async function upsertAdmin(email: string, password: string) {
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD");
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters");
  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUserModel.updateOne({ email: email.toLowerCase() }, { $set: { email: email.toLowerCase(), passwordHash } }, { upsert: true });
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI);
  await upsertAdmin(process.env.ADMIN_EMAIL ?? "", process.env.ADMIN_PASSWORD ?? "");
  console.log(`Admin ready: ${process.env.ADMIN_EMAIL}`);
  await mongoose.disconnect();
}

if (process.argv[1]?.includes("create-admin")) main().catch((e) => { console.error(e.message); process.exit(1); });
