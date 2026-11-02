import Lines from "./Lines";
import Media from "./Media";

export default function Story({ headline, paragraphs, images }: { headline: string; paragraphs: string[]; images: string[] }) {
  return (
    <section id="story" className="relative overflow-hidden py-[clamp(6rem,14vw,12rem)]" aria-labelledby="story-title">
      <div className="container-x">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow" data-reveal>Our Story · سنگت</p>
            <Lines id="story-title" text={headline} className="display mt-8 text-[clamp(2.8rem,6.5vw,6.4rem)] text-ivory" />
          </div>
          <div className="space-y-6 self-end text-[1.05rem] leading-[1.85] text-sand lg:col-span-5" data-reveal="stagger">
            {paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-gold" : ""}>{p}</p>
            ))}
          </div>
        </div>

        <div className="mt-[clamp(4rem,9vw,8rem)] grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 md:col-span-7">
            <div data-clip className="relative aspect-[4/3] overflow-hidden md:aspect-[16/11]">
              <Media src={images[0]} alt="Guests gathered on the lawn at Sangat" label="Lawn at dusk" tone="dusk" sizes="(min-width:768px) 58vw, 100vw" className="absolute inset-0" />
            </div>
          </div>
          <div className="col-span-7 md:col-span-5 md:mt-32">
            <div data-clip className="relative aspect-[3/4] overflow-hidden">
              <Media src={images[1]} alt="A shared table of desi dishes" label="Shared table" tone="clay" sizes="(min-width:768px) 40vw, 58vw" className="absolute inset-0" />
            </div>
          </div>
          <div className="col-span-5 -mt-24 md:col-span-4 md:col-start-3 md:-mt-40">
            <div className="relative aspect-square overflow-hidden" data-clip>
              <div className="absolute inset-[-12%]" data-parallax="0.2">
                <Media src={images[2]} alt="Traditional seating at Sangat" label="Seating" tone="lawn" sizes="(min-width:768px) 33vw, 42vw" className="absolute inset-0" />
              </div>
            </div>
          </div>
          <blockquote className="col-span-12 self-center md:col-span-5 md:col-start-8 md:mt-10" data-reveal>
            <p className="display text-[clamp(1.6rem,2.6vw,2.4rem)] italic text-ivory/90">
              &ldquo;Sangat&rdquo; is companionship: the company you keep, and the table you share.
            </p>
            <span className="mt-6 block h-px w-16 bg-gold" />
          </blockquote>
        </div>
      </div>
    </section>
  );
}
