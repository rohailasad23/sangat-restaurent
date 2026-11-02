"use client";

import { useState } from "react";
import type { Feature } from "@/lib/types";
import Media, { type Tone } from "./Media";

const TONES: Tone[] = ["lawn", "clay", "dusk", "ember", "smoke"];

/** Cinematic feature list: one large image that cross-fades as the visitor hovers, focuses or scrolls through each line. */
export default function Experience({ features }: { features: Feature[] }) {
  const items = features.filter((f) => f.enabled);
  const [active, setActive] = useState(0);
  if (items.length === 0) return null;

  return (
    <section id="experience" className="relative bg-coal py-[clamp(6rem,12vw,10rem)]" aria-labelledby="exp-title">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow" data-reveal>The Experience</p>
            <h2 id="exp-title" className="display mt-6 max-w-3xl text-[clamp(2.6rem,5.5vw,5rem)]" data-reveal>
              An evening, <em className="text-gold">unhurried.</em>
            </h2>
          </div>
          <p className="max-w-sm text-sand" data-reveal>Come for dinner, stay for the conversation. Here is what an evening at Sangat looks like.</p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="relative hidden lg:col-span-6 lg:block">
            <div className="sticky top-28 aspect-[4/5] overflow-hidden" data-clip>
              {items.map((f, i) => (
                <div key={f.title} className="absolute inset-0 transition-[opacity,transform] duration-[1200ms] ease-[var(--ease-soft)]"
                  style={{ opacity: active === i ? 1 : 0, transform: active === i ? "scale(1)" : "scale(1.06)" }} aria-hidden={active !== i}>
                  <Media src={f.image} alt={f.title} label={f.title} tone={TONES[i % TONES.length]} sizes="50vw" className="absolute inset-0" />
                </div>
              ))}
              <span className="absolute right-5 top-5 font-serif text-xl text-ivory/70">{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            </div>
          </div>

          <ol className="lg:col-span-6">
            {items.map((f, i) => (
              <li key={f.title} className="border-t border-line last:border-b">
                <button type="button" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}
                  className="group grid w-full grid-cols-[3rem_1fr] gap-x-4 py-8 text-left lg:py-10" aria-pressed={active === i}>
                  <span className={`font-serif text-lg transition-colors ${active === i ? "text-gold" : "text-mute"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className={`display block text-[clamp(1.9rem,3.2vw,3rem)] transition-[color,transform] duration-500 ${active === i ? "translate-x-2 text-ivory" : "text-ivory/55 group-hover:text-ivory/85"}`}>{f.title}</span>
                    <span className="mt-3 block max-w-md text-[0.98rem] leading-relaxed text-sand">{f.text}</span>
                    <span className="relative mt-6 block aspect-[16/10] overflow-hidden lg:hidden">
                      <Media src={f.image} alt={f.title} label={f.title} tone={TONES[i % TONES.length]} sizes="100vw" className="absolute inset-0" />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
