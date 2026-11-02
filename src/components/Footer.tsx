import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { summarizeHours, telLink } from "@/lib/format";

export default function Footer({ s, onHome = true }: { s: SiteSettings; onHome?: boolean }) {
  const h = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  const socials = [
    { label: "Instagram", href: s.socials.instagram },
    { label: "TikTok", href: s.socials.tiktok },
    { label: "Facebook", href: s.socials.facebook },
  ].filter((x) => x.href);

  return (
    <footer className="relative overflow-hidden border-t border-line bg-night pt-24">
      <div className="container-x grid gap-14 pb-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="display text-5xl tracking-[0.2em]">SANGAT</p>
          <p className="mt-6 max-w-sm leading-relaxed text-sand">{s.footerStatement}</p>
          {socials.length > 0 && (
            <ul className="mt-8 flex gap-6">
              {socials.map((x) => (
                <li key={x.label}><a href={x.href} target="_blank" rel="noopener noreferrer" className="link-line text-xs font-semibold uppercase tracking-[0.2em] text-gold">{x.label}</a></li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label="Footer" className="md:col-span-2">
          <p className="label mb-4">Explore</p>
          <ul className="space-y-2 text-sand">
            {[["story", "Our Story"], ["menu", "Menu"], ["experience", "Experience"], ["gallery", "Gallery"], ["reserve", "Reservations"], ["contact", "Contact"]].map(([id, l]) => (
              <li key={id}><a href={h(id)} className="link-line hover:text-ivory">{l}</a></li>
            ))}
            <li><Link href="/menu" className="link-line hover:text-ivory">Full Menu</Link></li>
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="label mb-4">Visit</p>
          <address className="not-italic leading-relaxed text-sand">{s.address}</address>
          <a href={telLink(s.phone)} className="mt-3 block text-ivory">{s.phone}</a>
        </div>
        <div className="md:col-span-2">
          <p className="label mb-4">Hours</p>
          {summarizeHours(s.hours).map((x) => (
            <p key={x.label} className="text-sm text-sand"><span className="block text-mute">{x.label}</span>{x.value}</p>
          ))}
        </div>
      </div>
      <p aria-hidden className="display pointer-events-none select-none text-center text-[22vw] leading-[0.75] tracking-[0.08em] text-ivory/[0.035]">SANGAT</p>
      <div className="container-x flex flex-col justify-between gap-2 border-t border-line py-6 text-xs text-mute sm:flex-row">
        <p>© {new Date().getFullYear()} Sangat Restaurant, Multan. All rights reserved.</p>
        <p>Multan, Punjab, Pakistan</p>
      </div>
    </footer>
  );
}
