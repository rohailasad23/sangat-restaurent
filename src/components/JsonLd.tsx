import type { SiteData } from "@/lib/types";

const DAY: Record<string, string> = { Monday: "Mo", Tuesday: "Tu", Wednesday: "We", Thursday: "Th", Friday: "Fr", Saturday: "Sa", Sunday: "Su" };

/** Restaurant structured data built only from stored, editable restaurant facts. No ratings are invented. */
export default function JsonLd({ data }: { data: SiteData }) {
  const s = data.settings;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Sangat Restaurant Multan",
    url: base,
    telephone: s.phone,
    servesCuisine: ["Pakistani", "Desi", "BBQ"],
    address: { "@type": "PostalAddress", streetAddress: s.address, addressLocality: "Multan", addressRegion: "Punjab", addressCountry: "PK" },
    geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`,
    openingHoursSpecification: s.hours.filter((h) => !h.closed).map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${h.day}`, opens: h.open, closes: h.close })),
    openingHours: s.hours.filter((h) => !h.closed).map((h) => `${DAY[h.day] ?? h.day} ${h.open}-${h.close}`),
    menu: `${base}/menu`,
    acceptsReservations: "True",
    sameAs: Object.values(s.socials).filter(Boolean),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, "\\u003c") }} />;
}
