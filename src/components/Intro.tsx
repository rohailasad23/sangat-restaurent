"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export const INTRO_DONE = "sangat:intro-done";

function finish() {
  (window as unknown as { __sangatIntroDone?: boolean }).__sangatIntroDone = true;
  window.dispatchEvent(new Event(INTRO_DONE));
}

/**
 * Cinematic opening: darkness, a warm glow, the SANGAT wordmark rising in perspective,
 * then a push-through zoom into the hero. ~3s, skippable, shown once per browser session,
 * and never shown to visitors who prefer reduced motion.
 */
export default function Intro({ name }: { name: string }) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [show, setShow] = useState(true);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("sangat-intro") === "1"; } catch { /* storage blocked */ }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced || !root.current) {
      setShow(false);
      finish();
      return;
    }
    try { sessionStorage.setItem("sangat-intro", "1"); } catch { /* ignore */ }
    document.documentElement.style.overflow = "hidden";

    const el = root.current;
    const ctx = gsap.context(() => {
      const t = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          document.documentElement.style.overflow = "";
          setShow(false);
        },
      });
      t.fromTo(".intro-glow", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" })
        .fromTo(".intro-letter", { yPercent: 120, rotateX: -80, opacity: 0 }, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.2, stagger: 0.07 }, 0.25)
        .fromTo(".intro-word", { letterSpacing: "0.05em" }, { letterSpacing: "0.32em", duration: 1.8, ease: "power3.inOut" }, 0.3)
        .fromTo(".intro-sub", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 1.0)
        .add(() => finish(), 2.05)
        .to(".intro-sub", { opacity: 0, duration: 0.3, ease: "power1.in" }, 1.9)
        .to(".intro-word", { scale: 9, opacity: 0, duration: 1.1, ease: "expo.in" }, 1.95)
        .to(el, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, 2.6);
      tl.current = t;
    }, el);
    return () => {
      document.documentElement.style.overflow = "";
      ctx.revert();
    };
  }, []);

  const skip = () => {
    if (tl.current) tl.current.progress(1);
    document.documentElement.style.overflow = "";
    finish();
    setShow(false);
  };

  if (!show) return null;
  const letters = name.toUpperCase().split("");

  return (
    <div ref={root} className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-night" aria-hidden="false" role="presentation">
      <div className="intro-glow pointer-events-none absolute left-1/2 top-1/2 h-[90vmax] w-[90vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{ background: "radial-gradient(circle, rgba(194,138,76,0.32) 0%, rgba(106,74,54,0.18) 30%, transparent 62%)" }} />
      <div className="relative text-center" style={{ perspective: "900px" }}>
        <p className="intro-word display text-[clamp(3.5rem,15vw,12rem)] font-light text-ivory" style={{ letterSpacing: "0.05em" }}>
          <span className="sr-only">{name}</span>
          {letters.map((l, i) => (
            <span key={i} aria-hidden className="intro-letter inline-block opacity-0" style={{ transformOrigin: "50% 100%" }}>{l}</span>
          ))}
        </p>
        <p className="intro-sub eyebrow mt-4 opacity-0">Multan · Pakistan</p>
      </div>
      <button onClick={skip} className="absolute bottom-6 right-6 min-h-11 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-sand/80 transition hover:text-ivory sm:bottom-10 sm:right-10">
        Skip intro
      </button>
    </div>
  );
}
