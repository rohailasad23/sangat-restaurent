"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { INTRO_DONE } from "./Intro";

type Props = { eyebrow: string; headline: string; text: string; image: string; tagline: string };

/** Warm "evening on the lawn" atmosphere used until a real hero photograph is uploaded. */
function Atmosphere() {
  const lights = Array.from({ length: 18 }, (_, i) => ({
    left: 4 + ((i * 53) % 92),
    top: 18 + ((i * 37) % 30) + Math.sin(i) * 4,
    size: 3 + ((i * 7) % 6),
    o: 0.35 + ((i * 13) % 50) / 100,
  }));
  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0" style={{ background: "radial-gradient(90% 70% at 50% 110%, #5b3b24 0%, #2a1e15 38%, #121310 70%, #0b0c0a 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-[38%]" style={{ background: "linear-gradient(to top, #161a10 0%, rgba(30,36,22,0.7) 50%, transparent 100%)" }} />
      <svg className="absolute inset-x-0 top-[14%] h-[30%] w-full opacity-60" viewBox="0 0 1000 200" preserveAspectRatio="none">
        <path d="M0 40 Q 250 140 500 70 T 1000 50" fill="none" stroke="#c2a46c" strokeOpacity="0.25" strokeWidth="1" />
      </svg>
      {lights.map((l, i) => (
        <span key={i} className="absolute rounded-full" style={{
          left: `${l.left}%`, top: `${l.top}%`, width: l.size, height: l.size, opacity: l.o,
          background: "#f5c983", boxShadow: `0 0 ${l.size * 6}px ${l.size * 1.5}px rgba(245,180,100,0.35)`,
        }} />
      ))}
      <div className="absolute bottom-[12%] left-1/2 h-[40vmin] w-[60vmin] -translate-x-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(214,130,60,0.35), transparent 65%)" }} />
    </div>
  );
}

export default function Hero({ eyebrow, headline, text, image, tagline }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    let cleanup = () => {};
    const ctx = gsap.context(() => {
      gsap.set([".hero-line > span", ".hero-fade"], { opacity: 0 });
      gsap.set(".hero-bg", { scale: 1.18, clipPath: "inset(12% 12% 12% 12%)" });

      // Explicit scoping: play() can be invoked from inside the intro's GSAP context.
      const q = gsap.utils.selector(el);
      const play = () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(q(".hero-bg"), { scale: 1.04, clipPath: "inset(0% 0% 0% 0%)", duration: 2.2, ease: "expo.inOut" })
          .fromTo(q(".hero-line > span"), { yPercent: 115, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 1.5, stagger: 0.14 }, 0.7)
          .fromTo(q(".hero-fade"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.1 }, 1.2);
      };
      if ((window as unknown as { __sangatIntroDone?: boolean }).__sangatIntroDone) play();
      else {
        window.addEventListener(INTRO_DONE, play, { once: true });
        cleanup = () => window.removeEventListener(INTRO_DONE, play);
      }

      // Slow push-in and lift as the visitor scrolls away.
      gsap.to(".hero-bg-inner", { yPercent: 14, scale: 1.08, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-content", { yPercent: -18, opacity: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    }, el);
    return () => { cleanup(); ctx.revert(); };
  }, []);

  const lines = headline.split("\n");

  return (
    <section id="home" ref={root} className="relative flex min-h-svh items-end overflow-hidden pb-[12vh] pt-32" aria-labelledby="hero-title">
      <div className="hero-bg absolute inset-0 will-change-transform">
        <div className="hero-bg-inner absolute inset-0">
          {image ? <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" /> : <Atmosphere />}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(14,15,13,0.55)_0%,rgba(14,15,13,0.15)_40%,rgba(14,15,13,0.85)_100%)]" />
      </div>

      <div className="hero-content container-x relative">
        <p className="hero-fade eyebrow flex items-center gap-3">
          <svg aria-hidden width="10" height="14" viewBox="0 0 10 14" className="fill-gold"><path d="M5 0a5 5 0 0 0-5 5c0 3.8 5 9 5 9s5-5.2 5-9a5 5 0 0 0-5-5Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" /></svg>
          {eyebrow}
        </p>
        <h1 id="hero-title" className="display mt-6 text-[clamp(3.1rem,9.5vw,9.5rem)] text-ivory">
          {lines.map((l, i) => (
            <span key={i} className="hero-line block overflow-hidden pb-[0.06em]">
              <span className={`block ${i === lines.length - 1 ? "italic text-gold/95" : ""}`}>{l}</span>
            </span>
          ))}
        </h1>
        <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,32rem)_1fr] md:items-end">
          <p className="hero-fade max-w-xl text-[1.02rem] leading-relaxed text-sand">{text}</p>
          <div className="hero-fade flex flex-col gap-3 sm:flex-row md:justify-end">
            <a href="#menu" className="btn btn-gold">Explore Our Menu</a>
            <a href="#reserve" className="btn btn-ghost">Reserve Your Table</a>
          </div>
        </div>
      </div>

      <div className="hero-fade absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex" aria-hidden>
        <span className="text-[0.6rem] uppercase tracking-[0.4em] text-sand/70">{tagline}</span>
        <span className="relative h-12 w-px overflow-hidden bg-ivory/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.4s_var(--ease-cine)_infinite] bg-gold" />
        </span>
      </div>
    </section>
  );
}
