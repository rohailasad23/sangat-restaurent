import InquiryForm from "./InquiryForm";
import Media from "./Media";

export default function Gatherings({ text, enabled }: { text: string; enabled: boolean }) {
  return (
    <section className="relative overflow-hidden py-[clamp(6rem,12vw,10rem)]" aria-labelledby="groups-title">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden" data-clip>
            <Media alt="A large family gathered around a table" label="Family gathering" tone="dusk" sizes="(min-width:1024px) 40vw, 100vw" className="absolute inset-0" />
          </div>
          <ul className="absolute -bottom-6 right-0 hidden w-60 space-y-3 border border-line bg-night p-6 text-sm text-sand md:block" data-reveal="stagger">
            {["Family gatherings", "Friends' meetups", "Special occasions", "Large groups"].map((x) => (
              <li key={x} className="flex items-center gap-3"><span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-gold" />{x}</li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7 lg:pl-8">
          <p className="eyebrow" data-reveal>Family &amp; Group Dining</p>
          <h2 id="groups-title" className="display mt-6 text-[clamp(2.6rem,5vw,4.6rem)]" data-reveal>The more, <em className="text-gold">the merrier.</em></h2>
          <p className="mt-6 max-w-xl leading-relaxed text-sand" data-reveal>{text}</p>
          {enabled && <div className="mt-12"><InquiryForm kind="group" /></div>}
        </div>
      </div>
    </section>
  );
}
