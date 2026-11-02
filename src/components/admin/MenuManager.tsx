"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { api } from "./api";
import ImageField from "./ImageField";

type Item = { id: string; name: string; description: string; price: number | null; category: string; image: string; available: boolean; signature: boolean; dietary: string[]; spice: number; order: number };
type Cat = { id: string; name: string; slug: string; description: string; order: number };

const blank = (category: string): Omit<Item, "id"> => ({ name: "", description: "", price: null, category, image: "", available: true, signature: false, dietary: [], spice: 0, order: 0 });

function ItemForm({ initial, cats, onSave, onCancel }: { initial: Omit<Item, "id"> & { id?: string }; cats: Cat[]; onSave: (i: Item) => void; onCancel: () => void }) {
  const [f, setF] = useState(initial);
  const [priceText, setPriceText] = useState(initial.price === null ? "" : String(initial.price));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const price = priceText.trim() === "" ? null : Number(priceText);
    if (price !== null && (Number.isNaN(price) || price < 0)) return setErr("Price must be a positive number, or empty for 'Price on request'.");
    setBusy(true); setErr("");
    const { id, ...body } = { ...f, price };
    try {
      const res = id ? await api<{ item: Item }>(`/api/admin/menu/${id}`, "PATCH", body) : await api<{ item: Item }>("/api/admin/menu", "POST", body);
      onSave(res.item);
    } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded border border-gold-deep/50 bg-coal p-5 md:grid-cols-2">
      <label className="text-xs text-sand">Dish name *<input required className="admin-input mt-1" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <label className="text-xs text-sand">Price (PKR), leave empty for &ldquo;Price on request&rdquo;
        <input inputMode="numeric" className="admin-input mt-1" value={priceText} onChange={(e) => setPriceText(e.target.value)} placeholder="e.g. 1800" />
      </label>
      <label className="text-xs text-sand md:col-span-2">Description<textarea rows={2} maxLength={400} className="admin-input mt-1" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
      <label className="text-xs text-sand">Category
        <select className="admin-input mt-1" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </label>
      <label className="text-xs text-sand">Spice level
        <select className="admin-input mt-1" value={f.spice} onChange={(e) => setF({ ...f, spice: Number(e.target.value) })}>
          {["None", "Mild", "Medium", "Hot"].map((l, i) => <option key={i} value={i}>{l}</option>)}
        </select>
      </label>
      <label className="text-xs text-sand">Dietary tags (comma separated)
        <input className="admin-input mt-1" value={f.dietary.join(", ")} onChange={(e) => setF({ ...f, dietary: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="vegetarian, contains nuts" />
      </label>
      <label className="text-xs text-sand">Display order<input type="number" min={0} className="admin-input mt-1" value={f.order} onChange={(e) => setF({ ...f, order: Number(e.target.value) || 0 })} /></label>
      <ImageField value={f.image} onChange={(image) => setF({ ...f, image })} label="Food photo" />
      <div className="flex flex-wrap items-center gap-5 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.available} onChange={(e) => setF({ ...f, available: e.target.checked })} /> Available</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={f.signature} onChange={(e) => setF({ ...f, signature: e.target.checked })} /> Signature dish</label>
      </div>
      {err && <p className="text-sm text-[#f0a48f] md:col-span-2">{err}</p>}
      <div className="flex gap-2 md:col-span-2">
        <button disabled={busy} className="admin-btn admin-btn-primary">{busy ? "Saving…" : "Save dish"}</button>
        <button type="button" className="admin-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function Categories({ cats, setCats, items }: { cats: Cat[]; setCats: (c: Cat[]) => void; items: Item[] }) {
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    try {
      const { category } = await api<{ category: Cat }>("/api/admin/categories", "POST", { name, slug, order: cats.length + 1 });
      setCats([...cats, category]); setName(""); setErr("");
    } catch (x) { setErr((x as Error).message); }
  }
  async function rename(c: Cat, newName: string) {
    if (!newName.trim() || newName === c.name) return;
    try { const { category } = await api<{ category: Cat }>(`/api/admin/categories/${c.id}`, "PATCH", { name: newName }); setCats(cats.map((x) => (x.id === c.id ? category : x))); } catch (x) { setErr((x as Error).message); }
  }
  async function move(c: Cat, dir: -1 | 1) {
    const sorted = [...cats].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((x) => x.id === c.id), j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    const next = sorted.map((x, k) => ({ ...x, order: k + 1 }));
    setCats(next);
    await Promise.all(next.map((x) => api(`/api/admin/categories/${x.id}`, "PATCH", { order: x.order }))).catch((x) => setErr((x as Error).message));
  }
  async function remove(c: Cat) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try { await api(`/api/admin/categories/${c.id}`, "DELETE"); setCats(cats.filter((x) => x.id !== c.id)); } catch (x) { setErr((x as Error).message); }
  }
  return (
    <section className="rounded border border-line bg-coal p-5">
      <h2 className="font-serif text-2xl">Categories</h2>
      <ul className="mt-4 space-y-2">
        {[...cats].sort((a, b) => a.order - b.order).map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <input defaultValue={c.name} onBlur={(e) => rename(c, e.target.value)} className="admin-input" aria-label={`Rename ${c.name}`} />
            <span className="w-16 shrink-0 text-xs text-mute">{items.filter((i) => i.category === c.slug).length} dishes</span>
            <button className="admin-btn" onClick={() => move(c, -1)} aria-label={`Move ${c.name} up`}>↑</button>
            <button className="admin-btn" onClick={() => move(c, 1)} aria-label={`Move ${c.name} down`}>↓</button>
            <button className="admin-btn admin-btn-danger" onClick={() => remove(c)} aria-label={`Delete ${c.name}`}>✕</button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-4 flex gap-2">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="New category" className="admin-input" />
        <button className="admin-btn admin-btn-primary">Add</button>
      </form>
      {err && <p className="mt-2 text-sm text-[#f0a48f]">{err}</p>}
    </section>
  );
}

export default function MenuManager() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([api<{ items: Item[] }>("/api/admin/menu"), api<{ categories: Cat[] }>("/api/admin/categories")])
      .then(([m, c]) => { setItems(m.items); setCats(c.categories); })
      .catch((e) => { setErr(e.message); setItems([]); });
  }, []);

  async function quick(i: Item, patch: Partial<Item>) {
    setItems((xs) => xs!.map((x) => (x.id === i.id ? { ...x, ...patch } : x)));
    try { await api(`/api/admin/menu/${i.id}`, "PATCH", patch); } catch (e) { setErr((e as Error).message); setItems((xs) => xs!.map((x) => (x.id === i.id ? i : x))); }
  }
  async function remove(i: Item) {
    if (!confirm(`Delete "${i.name}" from the menu?`)) return;
    try { await api(`/api/admin/menu/${i.id}`, "DELETE"); setItems((xs) => xs!.filter((x) => x.id !== i.id)); } catch (e) { setErr((e as Error).message); }
  }
  const upsert = (n: Item) => { setItems((xs) => (xs!.some((x) => x.id === n.id) ? xs!.map((x) => (x.id === n.id ? n : x)) : [...xs!, n])); setEditing(null); };

  if (items === null) return <p className="text-sand">Loading…</p>;
  const term = q.toLowerCase();
  const sortedCats = [...cats].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl">Menu</h1>
        <div className="flex gap-2">
          <input type="search" placeholder="Search dishes" value={q} onChange={(e) => setQ(e.target.value)} className="admin-input w-56" aria-label="Search dishes" />
          <button className="admin-btn admin-btn-primary" onClick={() => setEditing("new")} disabled={cats.length === 0}>+ Add dish</button>
        </div>
      </div>
      {err && <p className="mt-4 text-sm text-[#f0a48f]">{err}</p>}
      {editing === "new" && <div className="mt-6"><ItemForm initial={blank(sortedCats[0]?.slug ?? "")} cats={sortedCats} onSave={upsert} onCancel={() => setEditing(null)} /></div>}

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          {sortedCats.map((c) => {
            const list = items.filter((i) => i.category === c.slug && (!term || i.name.toLowerCase().includes(term))).sort((a, b) => a.order - b.order);
            if (term && list.length === 0) return null;
            return (
              <section key={c.id}>
                <h2 className="mb-3 font-serif text-2xl text-gold">{c.name}</h2>
                {list.length === 0 && <p className="text-sm text-mute">No dishes yet.</p>}
                <ul className="space-y-2">
                  {list.map((i) => editing === i.id ? (
                    <li key={i.id}><ItemForm initial={i} cats={sortedCats} onSave={upsert} onCancel={() => setEditing(null)} /></li>
                  ) : (
                    <li key={i.id} className={`flex flex-wrap items-center gap-4 rounded border border-line bg-coal p-3 ${i.available ? "" : "opacity-60"}`}>
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-ember">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-40 flex-1">
                        <p className="font-medium">{i.name} {i.signature && <span className="ml-1 text-xs text-gold">★ Signature</span>}</p>
                        <p className={`text-sm ${i.price === null ? "italic text-mute" : "text-sand"}`}>{formatPrice(i.price)}</p>
                      </div>
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={i.available} onChange={(e) => quick(i, { available: e.target.checked })} /> Available</label>
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={i.signature} onChange={(e) => quick(i, { signature: e.target.checked })} /> Signature</label>
                      <button className="admin-btn" onClick={() => setEditing(i.id)}>Edit</button>
                      <button className="admin-btn admin-btn-danger" onClick={() => remove(i)} aria-label={`Delete ${i.name}`}>Delete</button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        <div><Categories cats={cats} setCats={setCats} items={items} /></div>
      </div>
    </div>
  );
}
