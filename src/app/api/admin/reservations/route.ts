import { adminRoute, serialize } from "@/lib/admin-api";
import { ReservationModel } from "@/lib/models";
import { RESERVATION_STATUSES } from "@/lib/types";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const GET = adminRoute(async ({ req }) => {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const date = url.searchParams.get("date");
  const q = url.searchParams.get("q")?.trim().slice(0, 60);
  const filter: Record<string, unknown> = {};
  if (status && (RESERVATION_STATUSES as readonly string[]).includes(status)) filter.status = status;
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) filter.date = date;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { phone: rx }, { email: rx }];
  }
  const items = await ReservationModel.find(filter).sort({ date: -1, time: -1 }).limit(500).lean();
  return { items: items.map((r) => { const o: Partial<typeof r> = { ...r }; delete o.dedupeKey; return serialize(o as typeof r); }) };
});
