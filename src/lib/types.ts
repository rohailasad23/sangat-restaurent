export type DayHours = { day: string; open: string; close: string; closed: boolean };

export type Review = {
  author: string;
  rating: number;
  text: string;
  date: string;
  source: string;
};

export type Feature = { title: string; text: string; image: string; enabled: boolean; verified: boolean };

export type SiteSettings = {
  name: string;
  tagline: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroText: string;
  heroImage: string;
  storyHeadline: string;
  storyParagraphs: string[];
  storyImages: string[];
  address: string;
  plusCode: string;
  lat: number;
  lng: number;
  phone: string;
  whatsapp: string;
  email: string;
  hours: DayHours[];
  hoursNote: string;
  socials: { instagram: string; tiktok: string; facebook: string };
  experiences: Feature[];
  craft: Feature[];
  rating: { value: number; count: number; source: string; asOf: string; show: boolean };
  reviews: Review[];
  groupInquiriesEnabled: boolean;
  groupText: string;
  reservationNote: string;
  footerStatement: string;
};

export type Category = { id: string; name: string; slug: string; description: string; order: number };

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  category: string; // category slug
  image: string;
  available: boolean;
  signature: boolean;
  dietary: string[];
  spice: number; // 0-3
  order: number;
};

export const GALLERY_CATEGORIES = ["food", "restaurant", "ambience", "outdoor", "events"] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export type GalleryImage = {
  id: string;
  url: string;
  alt: string;
  caption: string;
  category: GalleryCategory;
  order: number;
};

export const RESERVATION_STATUSES = ["pending", "confirmed", "rejected", "cancelled"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const SEATING_OPTIONS = [
  { value: "no-preference", label: "No preference" },
  { value: "outdoor", label: "Outdoor lawn" },
  { value: "family", label: "Family seating" },
  { value: "traditional", label: "Traditional charpai seating" },
] as const;

export type SiteData = {
  settings: SiteSettings;
  categories: Category[];
  menu: MenuItem[];
  gallery: GalleryImage[];
  source: "database" | "defaults";
};
