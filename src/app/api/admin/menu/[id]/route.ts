import { adminRoute, HttpError, parsePatch, refreshSite, serialize } from "@/lib/admin-api";
import { logActivity, MenuItemModel } from "@/lib/models";
import { menuItemSchema } from "@/lib/validation";

export const PATCH = adminRoute(async ({ req, id }) => {
  const data = await parsePatch(req, menuItemSchema.partial());
  const doc = await MenuItemModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!doc) throw new HttpError(404, "Menu item not found");
  await logActivity("menu.updated", doc.name);
  refreshSite();
  return { item: serialize(doc) };
});

export const DELETE = adminRoute(async ({ id }) => {
  const doc = await MenuItemModel.findByIdAndDelete(id).lean();
  if (!doc) throw new HttpError(404, "Menu item not found");
  await logActivity("menu.deleted", doc.name);
  refreshSite();
  return { ok: true };
});
