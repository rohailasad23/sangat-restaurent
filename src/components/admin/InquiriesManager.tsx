"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

type Inq = { id: string; kind: "contact" | "group"; name: string; phone: string; email: string; message: string; guests: number | null; date: string; occasion: string; status: "new" | "read" | "archived"; createdAt: string };

export default function InquiriesManager() {
  const [items, setItems] = useState<Inq[] | null>(null);
  const [show, setShow] = useState<"active" | "archived">("active");
  const [err, setErr] = useState("");
  useEffect(() => { api<{ items: Inq[] }>("/api/admin/inquiries").then((r) => setItems(r.items)).catch((e) => { setErr(e.message); setItems([]); }); }, []);

  async function setStatus(i: Inq, status: Inq["status"]) {
    try { await api(`/api/admin/inquiries/${i.id}`, "PATCH", { status }); setItems((xs) => xs!.map((x) => (x.id === i.id ? { ...x, status } : x))); } catch (e) { setErr((e as Error).message); }
  }
  async function remove(i: Inq) {
    if (!confirm(`Delete the message from ${i.name}?`)) return;
    try { await api(`/api/admin/inquiries/${i.id}`, "DELETE"); setItems((xs) => xs!.filter((x) => x.id !== i.id)); } catch (e) { setErr((e as Error).message); }
  }
  if (items === null) return <p className="text-sand">Loading…</p>;
  const list = items.filter((i) => (show === "archived" ? i.status === "archived" : i.status !== "archived"));

  return (
    <div className="max-w-4xl">
      <div className="flex items-end justify-between gap-4">
        <h1 className="display text-4xl">Inquiries</h1>
        <div className="flex gap-2">
          <button className={`admin-btn ${show === "active" ? "admin-btn-primary" : ""}`} onClick={() => setShow("active")}>Inbox</button>
          <button className={`admin-btn ${show === "archived" ? "admin-btn-primary" : ""}`} onClick={() => setShow("archived")}>Archived</button>
        </div>
      </div>
      {err && <p className="mt-4 text-sm text-[#f0a48f]">{err}</p>}
      {list.length === 0 ? <p className="mt-8 rounded border border-dashed border-line p-10 text-center text-sand">No messages here.</p> : (
        <ul className="mt-6 space-y-3">
          {list.map((i) => (
            <li key={i.id} className={`rounded border bg-coal p-5 ${i.status === "new" ? "border-gold-deep" : "border-line"}`}>
              <div className="flex flex-wrap items-center gap-3">
                {i.status === "new" && <span className="rounded bg-gold px-2 py-0.5 text-xs font-semibold text-night">New</span>}
                <span className="rounded border border-line px-2 py-0.5 text-xs capitalize text-sand">{i.kind === "group" ? "Group dining" : "Contact"}</span>
                <span className="font-medium">{i.name}</span>
                <time className="ml-auto text-xs text-mute">{new Date(i.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Karachi" })}</time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-sand">{i.message}</p>
              {i.kind === "group" && <p className="mt-2 text-xs text-mute">Guests: {i.guests ?? "–"} · Date: {i.date || "–"} · Occasion: {i.occasion || "–"}</p>}
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {i.phone && <a className="admin-btn" href={`tel:${i.phone}`}>Call {i.phone}</a>}
                {i.email && <a className="admin-btn" href={`mailto:${i.email}`}>Email</a>}
                {i.status === "new" && <button className="admin-btn" onClick={() => setStatus(i, "read")}>Mark read</button>}
                {i.status !== "archived" ? <button className="admin-btn" onClick={() => setStatus(i, "archived")}>Archive</button> : <button className="admin-btn" onClick={() => setStatus(i, "read")}>Restore</button>}
                <button className="admin-btn admin-btn-danger" onClick={() => remove(i)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
