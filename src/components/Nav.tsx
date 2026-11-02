"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "story", label: "Our Story" },
  { id: "menu", label: "Menu" },
  { id: "experience", label: "Experience" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
];

export default function Nav({ phone, onHome = true }: { phone: string; onHome?: boolean }) {
  const [solid, setSolid] = useState(!onHome);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!onHome) return;
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    LINKS.forEach((l) => { const el = document.getElementById(l.id); if (el) io.observe(el); });
    return () => { window.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, [onHome]);

  // Mobile menu: animation, scroll lock, focus trap and Escape to close.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (open) {
      document.body.style.overflow = "hidden";
      el.style.visibility = "visible";
      if (!reduced) {
        gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "expo.inOut" });
        gsap.fromTo(el.querySelectorAll("[data-m]"), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.06, delay: 0.3 });
      } else el.style.clipPath = "none";
      el.querySelector<HTMLElement>("a")?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
        if (e.key === "Tab") {
          const f = Array.from(el.querySelectorAll<HTMLElement>("a,button"));
          const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
    document.body.style.overflow = "";
    if (el.style.visibility === "visible") {
      const done = () => { el.style.visibility = "hidden"; };
      if (reduced) done();
      else gsap.to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: "expo.inOut", onComplete: done });
      toggle.current?.focus();
    }
  }, [open]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color,padding] duration-700 ${solid ? "border-b border-line/70 bg-night/88 py-3 backdrop-blur-md" : "border-b border-transparent py-6"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-gold focus:px-4 focus:py-2 focus:text-night">Skip to content</a>
      <nav aria-label="Main" className="container-x flex items-center justify-between gap-6">
        <Link href="/" className="group relative z-[60] flex items-baseline gap-3" aria-label="Sangat, home">
          <span className="display text-[1.9rem] tracking-[0.22em] text-ivory">SANGAT</span>
          <span className="hidden text-[0.6rem] uppercase tracking-[0.35em] text-gold sm:inline">Multan</span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a href={href(l.id)} aria-current={onHome && active === l.id ? "true" : undefined}
                className={`group relative py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-colors ${onHome && active === l.id ? "text-ivory" : "text-sand/75 hover:text-ivory"}`}>
                {l.label}
                <span aria-hidden className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-500 ${onHome && active === l.id ? "w-full" : "w-0 group-hover:w-full"}`} />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href={href("reserve")} className="btn btn-gold hidden !min-h-11 !px-5 sm:inline-flex">Reserve a Table</a>
          <button ref={toggle} type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu"
            className="relative z-[60] flex h-11 w-11 flex-col items-center justify-center gap-[7px] lg:hidden" aria-label={open ? "Close menu" : "Open menu"}>
            <span className={`h-px w-7 bg-ivory transition-transform duration-500 ${open ? "translate-y-[4px] rotate-45" : ""}`} />
            <span className={`h-px w-7 bg-ivory transition-transform duration-500 ${open ? "-translate-y-[4px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      <div id="mobile-menu" ref={panel} role="dialog" aria-modal="true" aria-label="Menu"
        className="fixed inset-0 z-[55] flex flex-col bg-coal px-6 pb-10 pt-28 lg:hidden" style={{ visibility: "hidden", clipPath: "inset(0 0 100% 0)" }}>
        <ul className="flex flex-1 flex-col justify-center gap-2">
          {[...LINKS, { id: "reserve", label: "Reserve a Table" }].map((l, i) => (
            <li key={l.id} className="overflow-hidden">
              <a data-m href={href(l.id)} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-2">
                <span className="text-[0.65rem] tracking-[0.2em] text-gold">0{i + 1}</span>
                <span className="display text-[2.6rem] text-ivory">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div data-m className="border-t border-line pt-6 text-sm text-sand">
          <p className="eyebrow mb-2">Call us</p>
          <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="text-lg text-ivory">{phone}</a>
        </div>
      </div>
    </header>
  );
}
