import { adminRoute, parseBody, refreshSite, serialize } from "@/lib/admin-api";
import { GalleryModel, logActivity } from "@/lib/models";
import { galleryImageSchema } from "@/lib/validation";

export const GET = adminRoute(async () => {
  const items = await GalleryModel.find().sort({ order: 1, createdAt: -1 }).lean();
  return { items: items.map(serialize) };
});

export const POST = adminRoute(async ({ req }) => {
  const data = await parseBody(req, galleryImageSchema);
  const doc = await GalleryModel.create(data);
  await logActivity("gallery.added", data.alt);
  refreshSite();
  return { item: serialize(doc.toObject()) };
});
