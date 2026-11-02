import type { SiteSettings } from "@/lib/types";

function Stars({ value, label }: { value: number; label?: string }) {
  return (
    <span className="inline-flex gap-1" role="img" aria-label={label ?? `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} aria-hidden width="14" height="14" viewBox="0 0 24 24" className={n <= Math.round(value) ? "fill-gold" : "fill-line"}>
          <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7L12 17.5 5.8 21.2l1.6-7L2 9.5l7.1-.6z" />
        </svg>
      ))}
    </span>
  );
}

function fmtDate(d: string) {
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function Reviews({ settings }: { settings: SiteSettings }) {
  const { rating, reviews, lat, lng } = settings;
  if (!rating.show && reviews.length === 0) return null;
  const sourceUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <section className="relative py-[clamp(6rem,12vw,10rem)]" aria-labelledby="reviews-title">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow" data-reveal>In Their Words</p>
          <h2 id="reviews-title" className="display mt-6 text-[clamp(2.6rem,4.5vw,4.2rem)]" data-reveal>What our guests <em className="text-gold">remember.</em></h2>
          {rating.show && rating.count > 0 && (
            <div className="mt-10 border-t border-line pt-8" data-reveal>
              <p className="display text-[5rem] leading-none text-ivory">{rating.value.toFixed(1)}</p>
              <div className="mt-3"><Stars value={rating.value} /></div>
              <p className="mt-3 text-sm text-sand">
                From {rating.count.toLocaleString("en-PK")} {rating.source} reviews{rating.asOf ? ` (as of ${rating.asOf})` : ""}.
              </p>
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="link-line mt-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Read all reviews on {rating.source} ↗
              </a>
            </div>
          )}
        </div>

        {reviews.length > 0 ? (
          <ul className="grid gap-px bg-line/60 sm:grid-cols-2 lg:col-span-8" data-reveal="stagger">
            {reviews.map((r, i) => (
              <li key={i} className={`flex flex-col bg-night p-8 ${i === 0 ? "sm:col-span-2" : ""}`}>
                <Stars value={r.rating} />
                <blockquote className={`display mt-6 flex-1 italic text-ivory/90 ${i === 0 ? "text-[clamp(1.7rem,2.6vw,2.4rem)]" : "text-[1.5rem]"}`}>
                  &ldquo;{r.text}&rdquo;
                </blockquote>
                <p className="mt-6 text-xs uppercase tracking-[0.2em] text-mute">
                  {r.author} · {r.source}{r.date ? ` · ${fmtDate(r.date)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sand lg:col-span-8">Guest reviews will appear here soon.</p>
        )}
      </div>
    </section>
  );
}
