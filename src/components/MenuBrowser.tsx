"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Category, MenuItem } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import Media from "./Media";

function Spice({ level }: { level: number }) {
  if (!level) return null;
  return (
    <span className="inline-flex items-center gap-0.5" title={`Spice level ${level} of 3`}>
      <span className="sr-only">Spice level {level} of 3</span>
      {[1, 2, 3].map((n) => (
        <span key={n} aria-hidden className={`h-1.5 w-1.5 rotate-45 ${n <= level ? "bg-clay" : "bg-line"}`} />
      ))}
    </span>
  );
}

export function MenuRow({ item }: { item: MenuItem }) {
  return (
    <li className={`group grid grid-cols-[4.5rem_1fr] gap-5 border-b border-line/70 py-6 sm:grid-cols-[6rem_1fr] ${item.available ? "" : "opacity-55"}`}>
      <div className="relative aspect-square overflow-hidden">
        <Media src={item.image} alt={item.name} tone="ember" sizes="96px" className="absolute inset-0" imgClassName="transition-transform duration-700 group-hover:scale-110" />
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-3">
          <h3 className="display text-[1.55rem] leading-tight text-ivory">{item.name}</h3>
          <span aria-hidden className="mb-1.5 hidden flex-1 border-b border-dotted border-mute/40 sm:block" />
          <span className={`ml-auto shrink-0 text-sm ${item.price === null ? "italic text-mute" : "text-gold"}`}>{formatPrice(item.price)}</span>
        </div>
        {item.description && <p className="mt-1.5 text-[0.93rem] leading-relaxed text-sand">{item.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.65rem] uppercase tracking-[0.18em] text-mute">
          {item.signature && <span className="text-gold">Signature</span>}
          {item.dietary.map((d) => <span key={d}>{d}</span>)}
          <Spice level={item.spice} />
          {!item.available && <span className="text-[#e59a80]">Currently unavailable</span>}
        </div>
      </div>
    </li>
  );
}

export default function MenuBrowser({ categories, items, compact = false }: { categories: Category[]; items: MenuItem[]; compact?: boolean }) {
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const usedCats = useMemo(() => categories.filter((c) => items.some((i) => i.category === c.slug)), [categories, items]);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter(
      (i) => (cat === "all" || i.category === cat) && (!term || i.name.toLowerCase().includes(term) || i.description.toLowerCase().includes(term)),
    );
  }, [items, cat, q]);
  const shown = compact ? filtered.slice(0, 8) : filtered;

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!list.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(list.current.querySelectorAll("li"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: "power3.out" });
  }, [cat, q]);

  const noPrices = items.every((i) => i.price === null);

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div role="group" aria-label="Menu categories" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
          {[{ slug: "all", name: "All" }, ...usedCats].map((c) => (
            <button key={c.slug} aria-pressed={cat === c.slug} onClick={() => setCat(c.slug)}
              className={`relative min-h-11 shrink-0 border px-5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-500 ${cat === c.slug ? "border-gold bg-gold text-night" : "border-line text-sand hover:border-gold-deep hover:text-ivory"}`}>
              {c.name}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:w-72">
          <span className="sr-only">Search the menu</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes…" className="field pr-8" />
          <svg aria-hidden className="absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        </label>
      </div>

      <div ref={list} className="mt-10" aria-live="polite">
        {shown.length === 0 ? (
          <p className="border-y border-line py-16 text-center text-sand">No dishes match &ldquo;{q}&rdquo;. Try another search or category.</p>
        ) : (
          <ul className="grid gap-x-14 md:grid-cols-2">
            {shown.map((i) => <MenuRow key={i.id} item={i} />)}
          </ul>
        )}
      </div>
      {noPrices && (
        <p className="mt-8 text-sm text-mute">Prices are being updated. Please ask our team or call us for today&rsquo;s prices.</p>
      )}
    </div>
  );
}
