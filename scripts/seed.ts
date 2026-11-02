/**
 * Seeds the database with the researched default content (no invented prices) and the first admin.
 * Safe to re-run: existing settings, categories and dishes are left untouched.
 *   npm run seed
 */
import "./env";
import mongoose from "mongoose";
import { DEFAULT_CATEGORIES, DEFAULT_MENU, DEFAULT_SETTINGS } from "../src/lib/defaults";
import { CategoryModel, MenuItemModel, SettingsModel } from "../src/lib/models";
import { upsertAdmin } from "./create-admin";

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([CategoryModel.init(), MenuItemModel.init(), SettingsModel.init()]);

  const s = await SettingsModel.updateOne({ key: "site" }, { $setOnInsert: { key: "site", data: DEFAULT_SETTINGS } }, { upsert: true });
  console.log(s.upsertedCount ? "Settings created" : "Settings already exist, left unchanged");

  for (const c of DEFAULT_CATEGORIES) await CategoryModel.updateOne({ slug: c.slug }, { $setOnInsert: c }, { upsert: true });
  console.log(`Categories: ${await CategoryModel.countDocuments()}`);

  if ((await MenuItemModel.countDocuments()) === 0) {
    await MenuItemModel.insertMany(DEFAULT_MENU);
    console.log(`Menu: inserted ${DEFAULT_MENU.length} dishes (prices empty, to be filled in the admin)`);
  } else console.log("Menu already has dishes, left unchanged");

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    await upsertAdmin(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
    console.log(`Admin ready: ${process.env.ADMIN_EMAIL}`);
  } else console.log("ADMIN_EMAIL/ADMIN_PASSWORD not set, no admin created");

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
