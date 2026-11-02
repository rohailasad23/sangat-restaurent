import { adminRoute, serialize } from "@/lib/admin-api";
import { InquiryModel } from "@/lib/models";

export const GET = adminRoute(async () => {
  const items = await InquiryModel.find().sort({ createdAt: -1 }).limit(500).lean();
  return { items: items.map(serialize) };
});
