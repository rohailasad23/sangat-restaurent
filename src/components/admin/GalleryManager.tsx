"use client";

import { useEffect, useState } from "react";
import { GALLERY_CATEGORIES } from "@/lib/types";
import { api, uploadImage } from "./api";

type G = { id: string; url: string; alt: string; caption: string; category: string; order: number };

export default function GalleryManager() {
  const [items, setItems] = useState<G[] | null>(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [category, setCategory] = useState<string>("food");

  useEffect(() => { api<{ items: G[] }>("/api/admin/gallery").then((r) => setItems(r.items)).catch((e) => { setErr(e.message); setItems([]); }); }, []);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setErr("");
    const added: G[] = [];
    let n = 0;
    for (const f of Array.from(files)) {
      setBusy(`Uploading ${++n} of ${files.length}…`);
      try {
        const url = await uploadImage(f);
        const alt = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 200) || "Sangat Restaurant";
        const { item } = await api<{ item: G }>("/api/admin/gallery", "POST", { url, alt, category, order: (items?.length ?? 0) + added.length + 1 });
        added.push(item);
      } catch (e) { setErr(`${f.name}: ${(e as Error).message}`); }
    }
    setItems((xs) => [...(xs ?? []), ...added]);
    setBusy("");
  }

  async function patch(g: G, p: Partial<G>) {
    try { const { item } = await api<{ item: G }>(`/api/admin/gallery/${g.id}`, "PATCH", p); setItems((xs) => xs!.map((x) => (x.id === g.id ? item : x))); } catch (e) { setErr((e as Error).message); }
  }
  async function move(g: G, dir: -1 | 1) {
    const sorted = [...items!].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((x) => x.id === g.id), j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    const next = sorted.map((x, k) => ({ ...x, order: k + 1 }));
    setItems(next);
    await Promise.all([next[i], next[j]].map((x) => api(`/api/admin/gallery/${x.id}`, "PATCH", { order: x.order }))).catch((e) => setErr(e.message));
  }
  async function remove(g: G) {
    if (!confirm("Delete this image from the gallery?")) return;
    try { await api(`/api/admin/gallery/${g.id}`, "DELETE"); setItems((xs) => xs!.filter((x) => x.id !== g.id)); } catch (e) { setErr((e as Error).message); }
  }

  if (items === null) return <p className="text-sand">Loading…</p>;
  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-6xl">
      <h1 className="display text-4xl">Gallery</h1>
      <p className="mt-2 text-sm text-sand">Upload genuine Sangat photographs only. JPEG, PNG, WebP or AVIF, up to 4 MB each. Write a short description of each photo for visitors who use screen readers.</p>
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded border border-dashed border-line p-5">
        <label className="text-xs text-sand">Category for new uploads
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input mt-1 w-48">
            {GALLERY_CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </label>
        <label className="admin-btn admin-btn-primary cursor-pointer self-end">
          {busy || "Upload photos"}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={!!busy} onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
        </label>
      </div>
      {err && <p className="mt-4 text-sm text-[#f0a48f]">{err}</p>}
      {sorted.length === 0 ? <p className="mt-8 text-center text-sand">No photos yet. The website shows labelled placeholders until you upload some.</p> : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((g, idx) => (
            <li key={g.id} className="overflow-hidden rounded border border-line bg-coal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.url} alt={g.alt} className="aspect-[4/3] w-full object-cover" />
              <div className="space-y-2 p-3">
                <input defaultValue={g.alt} onBlur={(e) => e.target.value !== g.alt && e.target.value.trim() && patch(g, { alt: e.target.value })} className="admin-input" aria-label="Description (alt text)" placeholder="Description (alt text)" />
                <input defaultValue={g.caption} onBlur={(e) => e.target.value !== g.caption && patch(g, { caption: e.target.value })} className="admin-input" aria-label="Caption" placeholder="Caption (optional)" />
                <div className="flex items-center gap-2">
                  <select value={g.category} onChange={(e) => patch(g, { category: e.target.value })} className="admin-input" aria-label="Category">
                    {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button className="admin-btn" disabled={idx === 0} onClick={() => move(g, -1)} aria-label="Move earlier">←</button>
                  <button className="admin-btn" disabled={idx === sorted.length - 1} onClick={() => move(g, 1)} aria-label="Move later">→</button>
                  <button className="admin-btn admin-btn-danger" onClick={() => remove(g)} aria-label="Delete image">✕</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
