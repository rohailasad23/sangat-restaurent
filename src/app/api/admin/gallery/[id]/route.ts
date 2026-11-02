import { adminRoute, HttpError, parsePatch, refreshSite, serialize } from "@/lib/admin-api";
import { GalleryModel, logActivity, MediaModel } from "@/lib/models";
import { galleryImageSchema } from "@/lib/validation";

export const PATCH = adminRoute(async ({ req, id }) => {
  const data = await parsePatch(req, galleryImageSchema.partial());
  const doc = await GalleryModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!doc) throw new HttpError(404, "Image not found");
  refreshSite();
  return { item: serialize(doc) };
});

export const DELETE = adminRoute(async ({ id }) => {
  const doc = await GalleryModel.findByIdAndDelete(id).lean();
  if (!doc) throw new HttpError(404, "Image not found");
  const m = /^\/api\/media\/([a-f0-9]{24})$/.exec(doc.url);
  if (m) await MediaModel.deleteOne({ _id: m[1] });
  await logActivity("gallery.deleted", doc.alt);
  refreshSite();
  return { ok: true };
});
