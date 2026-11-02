"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MenuItem } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import Media, { type Tone } from "./Media";

const TONES: Tone[] = ["ember", "clay", "dusk", "smoke", "lawn"];

/**
 * Signature dishes. On large screens (with motion allowed) the row is pinned and scrubbed horizontally;
 * on touch/mobile it is a native swipeable scroll-snap row, so scrolling is never hijacked.
 */
export default function Signature({ dishes }: { dishes: MenuItem[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!section.current || !track.current || dishes.length < 2) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const t = track.current!;
      const distance = () => t.scrollWidth - window.innerWidth;
      const tween = gsap.to(t, {
        x: () => -distance(), ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      gsap.utils.toArray<HTMLElement>(".sig-img", t).forEach((img) => {
        gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: img, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
    });
    return () => mm.revert();
  }, [dishes.length]);

  if (dishes.length === 0) return null;

  return (
    <section id="signature" ref={section} className="relative overflow-hidden bg-night py-24 lg:flex lg:h-svh lg:items-center lg:py-0" aria-labelledby="sig-title">
      <div ref={track} className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 [scrollbar-width:none] lg:snap-none lg:gap-10 lg:overflow-visible lg:px-[6vw] lg:pb-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex w-[80vw] shrink-0 snap-start flex-col justify-center sm:w-[50vw] lg:w-[30vw]">
          <p className="eyebrow">Signature Dishes</p>
          <h2 id="sig-title" className="display mt-6 text-[clamp(2.8rem,5vw,5.2rem)]">The plates<br /><em className="text-gold">guests return for.</em></h2>
          <p className="mt-6 max-w-xs text-sand">Chosen from the dishes our guests mention most. <span className="lg:hidden">Swipe to explore.</span></p>
        </div>
        {dishes.map((d, i) => (
          <article key={d.id} className="group w-[80vw] shrink-0 snap-start sm:w-[46vw] lg:w-[34vw]">
            <div className="relative aspect-[4/5] overflow-hidden">
              <div className="sig-img absolute inset-[-8%]">
                <Media src={d.image} alt={d.name} label={d.name} tone={TONES[i % TONES.length]} sizes="(min-width:1024px) 34vw, 80vw"
                  className="absolute inset-0" imgClassName="transition-transform duration-[1400ms] ease-[var(--ease-soft)] group-hover:scale-[1.06]" />
              </div>
              <span className="absolute left-5 top-5 font-serif text-lg text-ivory/80">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="mt-6 flex items-baseline justify-between gap-4">
              <h3 className="display text-[2rem]">{d.name}</h3>
              <span className="shrink-0 text-sm tracking-wide text-gold">{formatPrice(d.price)}</span>
            </div>
            <p className="mt-2 max-w-sm text-[0.95rem] leading-relaxed text-sand">{d.description}</p>
          </article>
        ))}
        <div aria-hidden className="w-1 shrink-0 lg:w-[6vw]" />
      </div>
    </section>
  );
}
