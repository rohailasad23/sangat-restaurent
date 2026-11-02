"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RESERVATION_STATUSES, SEATING_OPTIONS, type ReservationStatus } from "@/lib/types";
import { whatsappLink } from "@/lib/format";
import { api } from "./api";

type R = { id: string; name: string; phone: string; email: string; date: string; time: string; guests: number; seating: string; requests: string; status: ReservationStatus; notes: string; createdAt: string };

const badge: Record<ReservationStatus, string> = {
  pending: "bg-gold/15 text-gold border-gold/40",
  confirmed: "bg-olive/25 text-[#c9d3a0] border-olive",
  rejected: "bg-[#3a1a14] text-[#f0a48f] border-[#6b2d22]",
  cancelled: "bg-ember text-mute border-line",
};

function Row({ r, onChange, onDelete }: { r: R; onChange: (r: R) => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(r);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save(patch: Partial<R>) {
    setBusy(true); setErr("");
    try {
      const { item } = await api<{ item: R }>(`/api/admin/reservations/${r.id}`, "PATCH", patch);
      onChange(item); setDraft(item);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  const seat = SEATING_OPTIONS.find((s) => s.value === r.seating)?.label ?? r.seating;
  const waText = `Assalam o Alaikum ${r.name}, your Sangat reservation for ${r.guests} on ${r.date} at ${r.time} is confirmed. See you soon!`;

  return (
    <li className="rounded border border-line bg-coal">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4">
        <span className={`rounded border px-2 py-0.5 text-xs capitalize ${badge[r.status]}`}>{r.status}</span>
        <span className="min-w-40 font-medium">{r.name}</span>
        <span className="text-sm text-sand">{r.date} · {r.time}</span>
        <span className="text-sm text-sand">{r.guests} guests</span>
        <span className="text-sm text-mute">{seat}</span>
        <a href={`tel:${r.phone}`} className="text-sm text-gold">{r.phone}</a>
        <div className="ml-auto flex flex-wrap gap-2">
          {r.status !== "confirmed" && <button disabled={busy} className="admin-btn admin-btn-primary" onClick={() => save({ status: "confirmed" })}>Confirm</button>}
          {r.status === "pending" && <button disabled={busy} className="admin-btn" onClick={() => save({ status: "rejected" })}>Reject</button>}
          {r.status === "confirmed" && <button disabled={busy} className="admin-btn" onClick={() => save({ status: "cancelled" })}>Cancel</button>}
          <button className="admin-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? "Close" : "Details"}</button>
        </div>
      </div>
      {err && <p className="px-4 pb-3 text-sm text-[#f0a48f]">{err}</p>}
      {open && (
        <div className="grid gap-4 border-t border-line p-4 md:grid-cols-2">
          <div className="space-y-3 text-sm">
            {r.email && <p><span className="text-mute">Email:</span> {r.email}</p>}
            <p><span className="text-mute">Requests:</span> {r.requests || "None"}</p>
            <p className="text-mute">Received {new Date(r.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Karachi" })}</p>
            <a className="admin-btn" target="_blank" rel="noopener noreferrer" href={whatsappLink(r.phone, waText)}>WhatsApp guest ↗</a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-sand">Date<input type="date" className="admin-input mt-1" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></label>
            <label className="text-xs text-sand">Time<input type="time" className="admin-input mt-1" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} /></label>
            <label className="text-xs text-sand">Guests<input type="number" min={1} max={100} className="admin-input mt-1" value={draft.guests} onChange={(e) => setDraft({ ...draft, guests: Number(e.target.value) })} /></label>
            <label className="text-xs text-sand">Seating
              <select className="admin-input mt-1" value={draft.seating} onChange={(e) => setDraft({ ...draft, seating: e.target.value })}>
                {SEATING_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <label className="col-span-2 text-xs text-sand">Internal notes (never shown to guests)
              <textarea rows={3} className="admin-input mt-1" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            </label>
            <div className="col-span-2 flex flex-wrap justify-between gap-2">
              <button className="admin-btn admin-btn-danger" onClick={async () => {
                if (!confirm(`Delete the reservation for ${r.name}? This cannot be undone.`)) return;
                try { await api(`/api/admin/reservations/${r.id}`, "DELETE"); onDelete(r.id); } catch (e) { setErr((e as Error).message); }
              }}>Delete</button>
              <button disabled={busy} className="admin-btn admin-btn-primary" onClick={() => save({ date: draft.date, time: draft.time, guests: draft.guests, seating: draft.seating, notes: draft.notes })}>{busy ? "Saving…" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function Manager() {
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [date, setDate] = useState("");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<R[] | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (date) sp.set("date", date);
    if (q.trim()) sp.set("q", q.trim());
    try { setErr(""); setItems((await api<{ items: R[] }>(`/api/admin/reservations?${sp}`)).items); } catch (e) { setErr((e as Error).message); setItems([]); }
  }, [status, date, q]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl">Reservations</h1>
        <button className="admin-btn" onClick={load}>Refresh</button>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <input type="search" placeholder="Search name, phone, email" value={q} onChange={(e) => setQ(e.target.value)} className="admin-input max-w-xs" aria-label="Search reservations" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="admin-input w-44" aria-label="Filter by status">
          <option value="">All statuses</option>
          {RESERVATION_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="admin-input w-44" aria-label="Filter by date" />
        {(status || date || q) && <button className="admin-btn" onClick={() => { setStatus(""); setDate(""); setQ(""); }}>Clear filters</button>}
      </div>
      {err && <p className="mt-4 text-sm text-[#f0a48f]">{err}</p>}
      {items === null ? <p className="mt-8 text-sand">Loading…</p> : items.length === 0 ? (
        <p className="mt-8 rounded border border-dashed border-line p-10 text-center text-sand">No reservations match these filters.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((r) => (
            <Row key={r.id} r={r} onChange={(n) => setItems((xs) => xs!.map((x) => (x.id === n.id ? n : x)))} onDelete={(id) => setItems((xs) => xs!.filter((x) => x.id !== id))} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ReservationsManager() {
  return <Suspense><Manager /></Suspense>;
}
