import type { DayHours } from "./types";

export function formatPrice(price: number | null): string {
  if (price === null || Number.isNaN(price)) return "Price on request";
  return `Rs. ${price.toLocaleString("en-PK")}`;
}

export function to12h(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Groups consecutive days with identical hours, e.g. "Monday – Sunday · 5:00 PM – 2:00 AM". */
export function summarizeHours(hours: DayHours[]): { label: string; value: string }[] {
  const groups: { start: string; end: string; value: string }[] = [];
  for (const h of hours) {
    const value = h.closed ? "Closed" : `${to12h(h.open)} – ${to12h(h.close)}`;
    const last = groups[groups.length - 1];
    if (last && last.value === value) last.end = h.day;
    else groups.push({ start: h.day, end: h.day, value });
  }
  return groups.map((g) => ({ label: g.start === g.end ? g.start : `${g.start} – ${g.end}`, value: g.value }));
}

export function digitsOnly(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

/** WhatsApp link for a Pakistani number, accepting 03xx or +92 forms. */
export function whatsappLink(phone: string, text?: string): string {
  let d = digitsOnly(phone);
  if (d.startsWith("0")) d = `92${d.slice(1)}`;
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

export function mapsDirections(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function mapsEmbed(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
}
