import type { Feature } from "@/lib/types";
import Media, { type Tone } from "./Media";

const TONES: Tone[] = ["ember", "clay", "smoke"];

export default function Craft({ steps }: { steps: Feature[] }) {
  const items = steps.filter((s) => s.enabled);
  if (!items.length) return null;
  return (
    <section className="relative overflow-hidden bg-coal py-[clamp(6rem,12vw,10rem)]" aria-labelledby="craft-title">
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow" data-reveal>The Craft</p>
          <h2 id="craft-title" className="display mt-6 text-[clamp(2.6rem,5.5vw,5rem)]" data-reveal>Fire, iron <em className="text-gold">&amp; patience.</em></h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {items.map((s, i) => (
            <figure key={s.title} className={`group ${i === 1 ? "md:mt-24" : ""}`}>
              <div data-clip className="relative aspect-[3/4] overflow-hidden">
                <Media src={s.image} alt={s.title} label={s.title} tone={TONES[i % 3]} sizes="(min-width:768px) 33vw, 100vw" className="absolute inset-0"
                  imgClassName="transition-transform duration-[1400ms] ease-[var(--ease-soft)] group-hover:scale-105" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
                <span className="absolute left-5 top-5 font-serif text-lg text-ivory/70">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <figcaption className="mt-6" data-reveal>
                <h3 className="display text-[2rem]">{s.title}</h3>
                <p className="mt-2 max-w-sm text-sand">{s.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
