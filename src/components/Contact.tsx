import type { SiteSettings } from "@/lib/types";
import { mapsDirections, mapsEmbed, summarizeHours, telLink, whatsappLink } from "@/lib/format";
import InquiryForm from "./InquiryForm";
import MapEmbed from "./MapEmbed";

export default function Contact({ s }: { s: SiteSettings }) {
  const hours = summarizeHours(s.hours);
  return (
    <section id="contact" className="relative bg-coal py-[clamp(6rem,12vw,10rem)]" aria-labelledby="contact-title">
      <div className="container-x">
        <p className="eyebrow" data-reveal>Find Us</p>
        <h2 id="contact-title" className="display mt-6 text-[clamp(2.6rem,5.5vw,5rem)]" data-reveal>Come <em className="text-gold">sit with us.</em></h2>

        <div className="mt-16 grid gap-px bg-line/60 lg:grid-cols-12">
          <div className="grid gap-10 bg-coal p-0 py-2 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:pr-12">
            <div data-reveal>
              <p className="label">Address</p>
              <address className="mt-3 not-italic leading-relaxed text-ivory">{s.address}</address>
              {s.plusCode && <p className="mt-1 text-sm text-mute">Plus code: {s.plusCode}</p>}
              <a href={mapsDirections(s.lat, s.lng)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-5 !min-h-11">Get Directions ↗</a>
            </div>
            <div data-reveal>
              <p className="label">Call or message</p>
              <a href={telLink(s.phone)} className="mt-3 block text-2xl font-light tracking-wide text-ivory tabular-nums hover:text-gold">{s.phone}</a>
              <a href={whatsappLink(s.whatsapp || s.phone, "Assalam o Alaikum, Sangat!")} target="_blank" rel="noopener noreferrer" className="link-line mt-2 inline-block text-sm text-gold">WhatsApp us ↗</a>
              {s.email && <a href={`mailto:${s.email}`} className="mt-2 block text-sand">{s.email}</a>}
            </div>
            <div data-reveal>
              <p className="label">Opening hours</p>
              <dl className="mt-3 space-y-1.5">
                {hours.map((h) => (
                  <div key={h.label} className="flex justify-between gap-6 text-ivory"><dt className="text-sand">{h.label}</dt><dd>{h.value}</dd></div>
                ))}
              </dl>
              {s.hoursNote && <p className="mt-3 text-xs text-mute">{s.hoursNote}</p>}
            </div>
          </div>
          <div className="min-h-[24rem] lg:col-span-7">
            <MapEmbed src={mapsEmbed(s.lat, s.lng)} title="Map showing Sangat Restaurant on the Northern Bypass, Multan" />
          </div>
        </div>

        <div className="mt-24 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h3 className="display text-[2.4rem]">Send us a message</h3>
            <p className="mt-4 text-sand">Questions, feedback or anything else. We read every message.</p>
          </div>
          <div className="lg:col-span-8"><InquiryForm kind="contact" /></div>
        </div>
      </div>
    </section>
  );
}
