import Link from "next/link";
import { connectDB } from "@/lib/db";
import { ActivityModel, InquiryModel, MenuItemModel, ReservationModel } from "@/lib/models";

function todayPk() {
  return new Date(Date.now() + 5 * 3600_000).toISOString().slice(0, 10);
}

export default async function Dashboard() {
  await connectDB();
  const today = todayPk();
  const [total, pending, confirmed, cancelled, rejected, todayCount, menuTotal, unavailable, unpriced, inqTotal, inqNew, activity, upcoming] = await Promise.all([
    ReservationModel.countDocuments(),
    ReservationModel.countDocuments({ status: "pending" }),
    ReservationModel.countDocuments({ status: "confirmed" }),
    ReservationModel.countDocuments({ status: "cancelled" }),
    ReservationModel.countDocuments({ status: "rejected" }),
    ReservationModel.countDocuments({ date: today, status: { $in: ["pending", "confirmed"] } }),
    MenuItemModel.countDocuments(),
    MenuItemModel.countDocuments({ available: false }),
    MenuItemModel.countDocuments({ price: null }),
    InquiryModel.countDocuments(),
    InquiryModel.countDocuments({ status: "new" }),
    ActivityModel.find().sort({ createdAt: -1 }).limit(12).lean(),
    ReservationModel.find({ date: { $gte: today }, status: "pending" }).sort({ date: 1, time: 1 }).limit(6).lean(),
  ]);

  const stats = [
    { label: "Total reservations", value: total, href: "/admin/reservations" },
    { label: "Pending", value: pending, href: "/admin/reservations?status=pending", accent: pending > 0 },
    { label: "Confirmed", value: confirmed, href: "/admin/reservations?status=confirmed" },
    { label: "Cancelled / rejected", value: cancelled + rejected, href: "/admin/reservations?status=cancelled" },
    { label: "Menu items", value: menuTotal, href: "/admin/menu" },
    { label: "Unavailable dishes", value: unavailable, href: "/admin/menu" },
    { label: "Inquiries", value: inqTotal, href: "/admin/inquiries" },
    { label: "New inquiries", value: inqNew, href: "/admin/inquiries", accent: inqNew > 0 },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="display text-4xl">Dashboard</h1>
      <p className="mt-2 text-sm text-sand">{todayCount} open reservation{todayCount === 1 ? "" : "s"} today ({today}).</p>

      {unpriced > 0 && (
        <div className="mt-6 rounded border border-gold-deep/60 bg-ember p-4 text-sm text-sand">
          <strong className="text-gold">{unpriced} dish{unpriced === 1 ? "" : "es"} have no price yet</strong> and show &ldquo;Price on request&rdquo; on the website.{" "}
          <Link href="/admin/menu" className="underline">Add prices</Link>
        </div>
      )}

      <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="block rounded border border-line bg-coal p-5 hover:border-gold-deep">
              <p className="text-xs text-mute">{s.label}</p>
              <p className={`mt-2 text-3xl font-light tabular-nums ${s.accent ? "text-gold" : ""}`}>{s.value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded border border-line bg-coal p-5">
          <h2 className="font-serif text-2xl">Upcoming pending requests</h2>
          {upcoming.length === 0 ? <p className="mt-4 text-sm text-mute">Nothing waiting for confirmation.</p> : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {upcoming.map((r) => (
                <li key={String(r._id)} className="flex justify-between gap-4 py-2.5">
                  <span>{r.name} · {r.guests} guests</span>
                  <span className="text-sand">{r.date} {r.time}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded border border-line bg-coal p-5">
          <h2 className="font-serif text-2xl">Recent activity</h2>
          {activity.length === 0 ? <p className="mt-4 text-sm text-mute">No activity yet.</p> : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {activity.map((a) => (
                <li key={String(a._id)} className="flex justify-between gap-4 py-2.5">
                  <span><span className="text-gold">{a.action}</span> <span className="text-sand">{a.detail}</span></span>
                  <time className="shrink-0 text-xs text-mute">{new Date(a.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Karachi", dateStyle: "short", timeStyle: "short" })}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
