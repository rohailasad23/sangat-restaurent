import { adminRoute, HttpError, parsePatch, serialize } from "@/lib/admin-api";
import { logActivity, ReservationModel } from "@/lib/models";
import { reservationUpdateSchema } from "@/lib/validation";

export const PATCH = adminRoute(async ({ req, id }) => {
  const data = await parsePatch(req, reservationUpdateSchema);
  const doc = await ReservationModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!doc) throw new HttpError(404, "Reservation not found");
  await logActivity(data.status ? `reservation.${data.status}` : "reservation.updated", `${doc.name}, ${doc.date} ${doc.time}`);
  const rest: Partial<typeof doc> = { ...doc };
  delete rest.dedupeKey;
  return { item: serialize(rest as typeof doc) };
});

export const DELETE = adminRoute(async ({ id }) => {
  const doc = await ReservationModel.findByIdAndDelete(id).lean();
  if (!doc) throw new HttpError(404, "Reservation not found");
  await logActivity("reservation.deleted", doc.name);
  return { ok: true };
});
