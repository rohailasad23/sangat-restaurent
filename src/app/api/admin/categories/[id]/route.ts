import { adminRoute, HttpError, parsePatch, refreshSite, serialize } from "@/lib/admin-api";
import { CategoryModel, logActivity, MenuItemModel } from "@/lib/models";
import { categorySchema } from "@/lib/validation";

export const PATCH = adminRoute(async ({ req, id }) => {
  const data = await parsePatch(req, categorySchema.partial());
  const before = await CategoryModel.findById(id).lean();
  if (!before) throw new HttpError(404, "Category not found");
  const doc = await CategoryModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (data.slug && data.slug !== before.slug) await MenuItemModel.updateMany({ category: before.slug }, { category: data.slug });
  await logActivity("category.updated", doc!.name);
  refreshSite();
  return { category: serialize(doc!) };
});

export const DELETE = adminRoute(async ({ id }) => {
  const cat = await CategoryModel.findById(id).lean();
  if (!cat) throw new HttpError(404, "Category not found");
  const count = await MenuItemModel.countDocuments({ category: cat.slug });
  if (count > 0) throw new HttpError(409, `Move or delete the ${count} dish(es) in "${cat.name}" first.`);
  await CategoryModel.deleteOne({ _id: id });
  await logActivity("category.deleted", cat.name);
  refreshSite();
  return { ok: true };
});
