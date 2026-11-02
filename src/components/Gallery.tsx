"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { GALLERY_CATEGORIES, type GalleryImage } from "@/lib/types";
import Media, { type Tone } from "./Media";

const LABELS: Record<string, string> = { food: "Food", restaurant: "Restaurant", ambience: "Ambience", outdoor: "Outdoor Dining", events: "Events" };

function Lightbox({ images, index, onClose, onIndex }: { images: GalleryImage[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const imgWrap = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const img = images[index];
  const go = useCallback((d: number) => onIndex((index + d + images.length) % images.length), [index, images.length, onIndex]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    d.addEventListener("keydown", onKey);
    return () => d.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    if (!imgWrap.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(imgWrap.current, { opacity: 0, scale: 0.97, clipPath: "inset(6% 6% 6% 6%)" }, { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "expo.out" });
  }, [index]);

  return (
    <dialog ref={ref} onClose={onClose} onCancel={onClose} aria-label={img.alt}
      className="m-0 h-svh max-h-none w-screen max-w-none bg-night/97 p-0 text-ivory backdrop:bg-night/90"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-xs tracking-[0.25em] text-sand">{index + 1} / {images.length}</span>
          <button onClick={() => ref.current?.close()} className="min-h-11 px-3 text-xs font-semibold uppercase tracking-[0.25em] text-sand hover:text-ivory" autoFocus>Close ✕</button>
        </div>
        <div className="relative flex-1">
          <div ref={imgWrap} className="absolute inset-4 sm:inset-x-20">
            <Image src={img.url} alt={img.alt} fill sizes="100vw" className="object-contain" />
          </div>
          <button onClick={() => go(-1)} aria-label="Previous image" className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-line text-ivory hover:border-gold sm:flex">←</button>
          <button onClick={() => go(1)} aria-label="Next image" className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-line text-ivory hover:border-gold sm:flex">→</button>
        </div>
        <p className="px-5 py-5 text-center text-sm text-sand">{img.caption || img.alt}</p>
      </div>
    </dialog>
  );
}

const PH: { tone: Tone; label: string; tall?: boolean }[] = [
  { tone: "dusk", label: "Lawn at night", tall: true }, { tone: "ember", label: "BBQ" }, { tone: "lawn", label: "Outdoor seating" },
  { tone: "clay", label: "Karahi", tall: true }, { tone: "smoke", label: "Family table" }, { tone: "ember", label: "Fresh naan" },
];

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<number | null>(null);
  const cats = useMemo(() => GALLERY_CATEGORIES.filter((c) => images.some((i) => i.category === c)), [images]);
  const shown = useMemo(() => (filter === "all" ? images : images.filter((i) => i.category === filter)), [images, filter]);

  return (
    <section id="gallery" className="relative py-[clamp(6rem,12vw,10rem)]" aria-labelledby="gallery-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="eyebrow" data-reveal>Gallery</p>
            <h2 id="gallery-title" className="display mt-6 text-[clamp(2.6rem,5.5vw,5rem)]" data-reveal>Moments <em className="text-gold">at Sangat</em></h2>
          </div>
          {cats.length > 1 && (
            <div role="group" aria-label="Filter gallery" className="flex flex-wrap gap-2">
              {["all", ...cats].map((c) => (
                <button key={c} onClick={() => setFilter(c)} aria-pressed={filter === c}
                  className={`min-h-11 border px-4 text-[0.68rem] font-semibold uppercase tracking-[0.2em] transition-colors ${filter === c ? "border-gold text-gold" : "border-line text-sand hover:text-ivory"}`}>
                  {c === "all" ? "All" : LABELS[c]}
                </button>
              ))}
            </div>
          )}
        </div>

        {images.length === 0 ? (
          <>
            <div className="mt-14 columns-2 gap-4 md:columns-3 md:gap-6">
              {PH.map((p, i) => (
                <div key={i} data-clip className={`relative mb-4 break-inside-avoid overflow-hidden md:mb-6 ${p.tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
                  <Media alt={p.label} label={p.label} tone={p.tone} className="absolute inset-0" />
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-mute">Official Sangat photography is on its way. Meanwhile, follow the restaurant on Instagram for the latest.</p>
          </>
        ) : (
          <ul className="mt-14 columns-2 gap-4 md:columns-3 md:gap-6">
            {shown.map((img, i) => (
              <li key={img.id} className="mb-4 break-inside-avoid md:mb-6">
                <button onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden" aria-label={`Open image: ${img.alt}`}>
                  <Image src={img.url} alt={img.alt} width={800} height={i % 3 === 0 ? 1060 : 600} sizes="(min-width:768px) 33vw, 50vw" loading="lazy"
                    className="h-auto w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-soft)] group-hover:scale-[1.05]" />
                  <span className="absolute inset-0 flex items-end bg-gradient-to-t from-night/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="text-left text-sm text-ivory">{img.caption || img.alt}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {open !== null && shown[open] && <Lightbox images={shown} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
