"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Site-wide scroll motion. Attribute-driven so sections stay readable without JS:
 *  data-reveal          fade + rise (data-reveal="stagger" staggers its children)
 *  data-clip            clip-path reveal from below with an inner image scale
 *  data-parallax="0.15" vertical parallax strength
 *  data-lines           splits a headline's lines (<span data-line>) into masked rises
 */
export default function MotionProvider() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    document.documentElement.classList.add("js-motion");

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const targets = el.dataset.reveal === "stagger" ? Array.from(el.children) : [el];
        gsap.set(el, { opacity: 1 });
        gsap.fromTo(
          targets,
          { y: 36, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1.1, ease: "power3.out", stagger: 0.09,
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-clip]").forEach((el) => {
        const inner = el.querySelector("img, [role='img']");
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } });
        tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" });
        if (inner) tl.fromTo(inner, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0);
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const strength = parseFloat(el.dataset.parallax || "0.15");
        gsap.fromTo(
          el,
          { yPercent: -strength * 50 },
          { yPercent: strength * 50, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-lines]").forEach((el) => {
        const lines = el.querySelectorAll("[data-line] > span");
        gsap.fromTo(
          lines,
          { yPercent: 110, rotate: 2 },
          { yPercent: 0, rotate: 0, duration: 1.3, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: el, start: "top 85%", once: true } },
        );
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return null;
}
