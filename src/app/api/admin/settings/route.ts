import { adminRoute, parseBody, refreshSite } from "@/lib/admin-api";
import { getSettings } from "@/lib/data";
import { logActivity, SettingsModel } from "@/lib/models";
import { settingsSchema } from "@/lib/validation";

export const GET = adminRoute(async () => ({ settings: await getSettings() }));

export const PUT = adminRoute(async ({ req }) => {
  const data = await parseBody(req, settingsSchema);
  await SettingsModel.updateOne({ key: "site" }, { $set: { data } }, { upsert: true });
  await logActivity("settings.updated", "Website content");
  refreshSite();
  return { settings: data };
});
