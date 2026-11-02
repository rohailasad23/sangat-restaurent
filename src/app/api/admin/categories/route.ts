import { adminRoute, parseBody, refreshSite, serialize } from "@/lib/admin-api";
import { CategoryModel, logActivity } from "@/lib/models";
import { categorySchema } from "@/lib/validation";

export const GET = adminRoute(async () => {
  const cats = await CategoryModel.find().sort({ order: 1 }).lean();
  return { categories: cats.map(serialize) };
});

export const POST = adminRoute(async ({ req }) => {
  const data = await parseBody(req, categorySchema);
  const doc = await CategoryModel.create(data);
  await logActivity("category.created", data.name);
  refreshSite();
  return { category: serialize(doc.toObject()) };
});
