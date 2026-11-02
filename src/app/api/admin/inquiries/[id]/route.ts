import { z } from "zod";
import { adminRoute, HttpError, parseBody } from "@/lib/admin-api";
import { InquiryModel } from "@/lib/models";

export const PATCH = adminRoute(async ({ req, id }) => {
  const { status } = await parseBody(req, z.object({ status: z.enum(["new", "read", "archived"]) }));
  const doc = await InquiryModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  if (!doc) throw new HttpError(404, "Inquiry not found");
  return { ok: true };
});

export const DELETE = adminRoute(async ({ id }) => {
  await InquiryModel.deleteOne({ _id: id });
  return { ok: true };
});
