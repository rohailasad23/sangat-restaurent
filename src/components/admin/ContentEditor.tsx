"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Feature, Review, SiteSettings } from "@/lib/types";
import { api } from "./api";
import ImageField from "./ImageField";

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <details className="group rounded border border-line bg-coal" open>
      <summary className="cursor-pointer list-none p-5 font-serif text-2xl marker:hidden">
        <span className="mr-2 inline-block text-gold transition-transform group-open:rotate-90">›</span>{title}
        {hint && <span className="mt-1 block font-sans text-xs text-mute">{hint}</span>}
      </summary>
      <div className="grid gap-4 border-t border-line p-5 md:grid-cols-2">{children}</div>
    </details>
  );
}

function T({ label, value, onChange, area, wide, type = "text" }: { label: string; value: string | number; onChange: (v: string) => void; area?: boolean; wide?: boolean; type?: string }) {
  return (
    <label className={`text-xs text-sand ${wide || area ? "md:col-span-2" : ""}`}>
      {label}
      {area ? <textarea rows={3} className="admin-input mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
        : <input type={type} step="any" className="admin-input mt-1" value={value} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

function Features({ list, onChange, label }: { list: Feature[]; onChange: (l: Feature[]) => void; label: string }) {
  const set = (i: number, p: Partial<Feature>) => onChange(list.map((f, k) => (k === i ? { ...f, ...p } : f)));
  return (
    <div className="space-y-4 md:col-span-2">
      {list.map((f, i) => (
        <div key={i} className="grid gap-3 rounded border border-line p-4 md:grid-cols-2">
          <T label="Title" value={f.title} onChange={(v) => set(i, { title: v })} />
          <div className="flex flex-wrap items-end gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.enabled} onChange={(e) => set(i, { enabled: e.target.checked })} /> Show on website</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.verified} onChange={(e) => set(i, { verified: e.target.checked })} /> Confirmed by owner</label>
            <button type="button" className="admin-btn admin-btn-danger ml-auto" onClick={() => onChange(list.filter((_, k) => k !== i))}>Remove</button>
          </div>
          <T label="Text" value={f.text} onChange={(v) => set(i, { text: v })} area />
          <ImageField value={f.image} onChange={(image) => set(i, { image })} />
        </div>
      ))}
      {list.length < 8 && <button type="button" className="admin-btn" onClick={() => onChange([...list, { title: "", text: "", image: "", enabled: false, verified: false }])}>+ Add {label}</button>}
    </div>
  );
}

export default function ContentEditor() {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { api<{ settings: SiteSettings }>("/api/admin/settings").then((r) => setS(r.settings)).catch((e) => setMsg({ ok: false, text: e.message })); }, []);
  if (!s) return <p className="text-sand">{msg?.text ?? "Loading…"}</p>;
  const up = (p: Partial<SiteSettings>) => setS({ ...s, ...p });
  const setReview = (i: number, p: Partial<Review>) => up({ reviews: s.reviews.map((r, k) => (k === i ? { ...r, ...p } : r)) });

  async function save() {
    setBusy(true); setMsg(null);
    try { const r = await api<{ settings: SiteSettings }>("/api/admin/settings", "PUT", s); setS(r.settings); setMsg({ ok: true, text: "Saved. The website updates within a few seconds." }); }
    catch (e) { setMsg({ ok: false, text: (e as Error).message }); } finally { setBusy(false); }
  }

  return (
    <div className="max-w-5xl pb-28">
      <h1 className="display text-4xl">Website content</h1>
      <p className="mt-2 text-sm text-sand">Everything here appears on the public website. Only publish information you have confirmed.</p>

      <div className="mt-8 space-y-4">
        <Section title="Hero">
          <T label="Small location line" value={s.heroEyebrow} onChange={(v) => up({ heroEyebrow: v })} />
          <T label="Tagline" value={s.tagline} onChange={(v) => up({ tagline: v })} />
          <T label="Headline (new line = line break)" value={s.heroHeadline} onChange={(v) => up({ heroHeadline: v })} area />
          <T label="Supporting text" value={s.heroText} onChange={(v) => up({ heroText: v })} area />
          <ImageField value={s.heroImage} onChange={(heroImage) => up({ heroImage })} label="Hero photograph (wide, at least 2000px)" />
        </Section>

        <Section title="Brand story" hint="Avoid founding dates or history unless you can confirm them.">
          <T label="Headline (new line = line break)" value={s.storyHeadline} onChange={(v) => up({ storyHeadline: v })} area />
          {s.storyParagraphs.map((p, i) => (
            <T key={i} label={`Paragraph ${i + 1}`} value={p} onChange={(v) => up({ storyParagraphs: s.storyParagraphs.map((x, k) => (k === i ? v : x)) })} area />
          ))}
          <div className="flex gap-2 md:col-span-2">
            {s.storyParagraphs.length < 6 && <button type="button" className="admin-btn" onClick={() => up({ storyParagraphs: [...s.storyParagraphs, ""] })}>+ Paragraph</button>}
            {s.storyParagraphs.length > 1 && <button type="button" className="admin-btn" onClick={() => up({ storyParagraphs: s.storyParagraphs.slice(0, -1) })}>Remove last</button>}
          </div>
          {[0, 1, 2].map((i) => (
            <ImageField key={i} value={s.storyImages[i] ?? ""} label={`Story photo ${i + 1}`} onChange={(v) => { const imgs = [...s.storyImages]; while (imgs.length < 3) imgs.push(""); imgs[i] = v; up({ storyImages: imgs }); }} />
          ))}
        </Section>

        <Section title="Contact & location">
          <T label="Address" value={s.address} onChange={(v) => up({ address: v })} wide />
          <T label="Plus code" value={s.plusCode} onChange={(v) => up({ plusCode: v })} />
          <T label="Phone" value={s.phone} onChange={(v) => up({ phone: v })} />
          <T label="WhatsApp number (leave empty to use the phone number)" value={s.whatsapp} onChange={(v) => up({ whatsapp: v })} />
          <T label="Email (optional)" value={s.email} onChange={(v) => up({ email: v })} />
          <T label="Latitude" type="number" value={s.lat} onChange={(v) => up({ lat: Number(v) })} />
          <T label="Longitude" type="number" value={s.lng} onChange={(v) => up({ lng: Number(v) })} />
        </Section>

        <Section title="Opening hours">
          <div className="space-y-2 md:col-span-2">
            {s.hours.map((h, i) => (
              <div key={h.day} className="flex flex-wrap items-center gap-3">
                <span className="w-28 text-sm">{h.day}</span>
                <input type="time" aria-label={`${h.day} opens`} className="admin-input w-32" value={h.open} disabled={h.closed} onChange={(e) => up({ hours: s.hours.map((x, k) => (k === i ? { ...x, open: e.target.value } : x)) })} />
                <span className="text-mute">to</span>
                <input type="time" aria-label={`${h.day} closes`} className="admin-input w-32" value={h.close} disabled={h.closed} onChange={(e) => up({ hours: s.hours.map((x, k) => (k === i ? { ...x, close: e.target.value } : x)) })} />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={h.closed} onChange={(e) => up({ hours: s.hours.map((x, k) => (k === i ? { ...x, closed: e.target.checked } : x)) })} /> Closed</label>
              </div>
            ))}
            <button type="button" className="admin-btn" onClick={() => up({ hours: s.hours.map((x) => ({ ...x, open: s.hours[0].open, close: s.hours[0].close, closed: s.hours[0].closed })) })}>Copy Monday to all days</button>
          </div>
          <T label="Note under hours" value={s.hoursNote} onChange={(v) => up({ hoursNote: v })} wide />
        </Section>

        <Section title="Social media" hint="Full URLs. Leave empty to hide.">
          <T label="Instagram" value={s.socials.instagram} onChange={(v) => up({ socials: { ...s.socials, instagram: v } })} />
          <T label="TikTok" value={s.socials.tiktok} onChange={(v) => up({ socials: { ...s.socials, tiktok: v } })} />
          <T label="Facebook" value={s.socials.facebook} onChange={(v) => up({ socials: { ...s.socials, facebook: v } })} />
        </Section>

        <Section title="Experience highlights" hint="Only tick 'Show on website' for features the restaurant actually offers.">
          <Features list={s.experiences} onChange={(experiences) => up({ experiences })} label="highlight" />
        </Section>

        <Section title="The craft (food preparation)">
          <Features list={s.craft} onChange={(craft) => up({ craft })} label="step" />
        </Section>

        <Section title="Rating & reviews" hint="Use genuine reviews only, copied word for word with their source.">
          <T label="Average rating (0–5)" type="number" value={s.rating.value} onChange={(v) => up({ rating: { ...s.rating, value: Number(v) } })} />
          <T label="Number of reviews" type="number" value={s.rating.count} onChange={(v) => up({ rating: { ...s.rating, count: Math.round(Number(v)) } })} />
          <T label="Source" value={s.rating.source} onChange={(v) => up({ rating: { ...s.rating, source: v } })} />
          <T label="As of (e.g. November 2026)" value={s.rating.asOf} onChange={(v) => up({ rating: { ...s.rating, asOf: v } })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.rating.show} onChange={(e) => up({ rating: { ...s.rating, show: e.target.checked } })} /> Show rating</label>
          <div className="space-y-3 md:col-span-2">
            {s.reviews.map((r, i) => (
              <div key={i} className="grid gap-3 rounded border border-line p-4 md:grid-cols-4">
                <T label="Author" value={r.author} onChange={(v) => setReview(i, { author: v })} />
                <T label="Stars (1–5)" type="number" value={r.rating} onChange={(v) => setReview(i, { rating: Math.min(5, Math.max(1, Math.round(Number(v)))) })} />
                <T label="Date (YYYY-MM-DD)" value={r.date} onChange={(v) => setReview(i, { date: v })} />
                <T label="Source" value={r.source} onChange={(v) => setReview(i, { source: v })} />
                <label className="text-xs text-sand md:col-span-4">Review text<textarea rows={2} className="admin-input mt-1" value={r.text} onChange={(e) => setReview(i, { text: e.target.value })} /></label>
                <button type="button" className="admin-btn admin-btn-danger w-fit" onClick={() => up({ reviews: s.reviews.filter((_, k) => k !== i) })}>Remove review</button>
              </div>
            ))}
            {s.reviews.length < 12 && <button type="button" className="admin-btn" onClick={() => up({ reviews: [...s.reviews, { author: "", rating: 5, text: "", date: "", source: "Google" }] })}>+ Add review</button>}
          </div>
        </Section>

        <Section title="Reservations, groups & footer">
          <T label="Reservation notice" value={s.reservationNote} onChange={(v) => up({ reservationNote: v })} area />
          <T label="Group dining text" value={s.groupText} onChange={(v) => up({ groupText: v })} area />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.groupInquiriesEnabled} onChange={(e) => up({ groupInquiriesEnabled: e.target.checked })} /> Show group inquiry form</label>
          <T label="Footer statement" value={s.footerStatement} onChange={(v) => up({ footerStatement: v })} area />
        </Section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-night/95 p-4 backdrop-blur md:left-60">
        <div className="flex max-w-5xl items-center justify-between gap-4">
          <p role="status" className={`text-sm ${msg ? (msg.ok ? "text-[#c9d3a0]" : "text-[#f0a48f]") : "text-mute"}`}>{msg?.text ?? "Unsaved changes are lost if you leave this page."}</p>
          <button onClick={save} disabled={busy} className="admin-btn admin-btn-primary">{busy ? "Saving…" : "Save all changes"}</button>
        </div>
      </div>
    </div>
  );
}
