import { adminRoute, parseBody, refreshSite, serialize } from "@/lib/admin-api";
import { logActivity, MenuItemModel } from "@/lib/models";
import { menuItemSchema } from "@/lib/validation";

export const GET = adminRoute(async () => {
  const items = await MenuItemModel.find().sort({ category: 1, order: 1, name: 1 }).lean();
  return { items: items.map(serialize) };
});

export const POST = adminRoute(async ({ req }) => {
  const data = await parseBody(req, menuItemSchema);
  const doc = await MenuItemModel.create(data);
  await logActivity("menu.created", data.name);
  refreshSite();
  return { item: serialize(doc.toObject()) };
});
