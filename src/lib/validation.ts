import { z } from "zod";
import { GALLERY_CATEGORIES, RESERVATION_STATUSES, SEATING_OPTIONS } from "./types";

const phone = z
  .string()
  .trim()
  .min(7, "Please enter a valid phone number")
  .max(20, "Please enter a valid phone number")
  .regex(/^\+?[0-9\s-]{7,20}$/, "Use digits only, e.g. 0300 1234567");

const optionalEmail = z.union([z.literal(""), z.string().trim().email("Please enter a valid email").max(120)]);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a time");

function todayInPakistan(): string {
  return new Date(Date.now() + 5 * 3600_000).toISOString().slice(0, 10);
}

export const reservationSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(80),
    phone,
    email: optionalEmail.default(""),
    date: isoDate,
    time: hhmm,
    guests: z.coerce.number().int().min(1, "At least 1 guest").max(100, "For more than 100 guests, please call us"),
    seating: z.enum(SEATING_OPTIONS.map((s) => s.value) as [string, ...string[]]).default("no-preference"),
    requests: z.string().trim().max(600).default(""),
    website: z.string().max(0).optional(), // honeypot
  })
  .refine((v) => v.date >= todayInPakistan(), { message: "Please choose today or a future date", path: ["date"] })
  .refine(
    (v) => {
      const max = new Date(Date.now() + 5 * 3600_000 + 120 * 86400_000).toISOString().slice(0, 10);
      return v.date <= max;
    },
    { message: "Bookings open up to 120 days ahead", path: ["date"] },
  );

export const inquirySchema = z.object({
  kind: z.enum(["contact", "group"]).default("contact"),
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.union([z.literal(""), phone]).default(""),
  email: optionalEmail.default(""),
  message: z.string().trim().min(5, "Please write a short message").max(2000),
  guests: z.coerce.number().int().min(1).max(500).nullable().optional(),
  date: z.union([z.literal(""), isoDate]).default(""),
  occasion: z.string().trim().max(80).default(""),
  website: z.string().max(0).optional(),
}).refine((v) => v.phone || v.email, { message: "Add a phone number or email so we can reply", path: ["phone"] });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export const menuItemSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(400).default(""),
  price: z.number().min(0).max(1_000_000).nullable().default(null),
  category: z.string().trim().min(1).max(60),
  image: z.string().max(500).default(""),
  available: z.boolean().default(true),
  signature: z.boolean().default(false),
  dietary: z.array(z.string().trim().max(30)).max(10).default([]),
  spice: z.number().int().min(0).max(3).default(0),
  order: z.number().int().min(0).max(10000).default(0),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(60),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{1,60}$/, "Use lowercase letters, numbers and dashes"),
  description: z.string().trim().max(200).default(""),
  order: z.number().int().min(0).max(1000).default(0),
});

export const galleryImageSchema = z.object({
  url: z.string().min(1).max(500),
  alt: z.string().trim().min(1, "Alt text is required").max(200),
  caption: z.string().trim().max(300).default(""),
  category: z.enum(GALLERY_CATEGORIES).default("restaurant"),
  order: z.number().int().min(0).max(10000).default(0),
});

export const reservationUpdateSchema = z.object({
  status: z.enum(RESERVATION_STATUSES).optional(),
  notes: z.string().max(2000).optional(),
  date: isoDate.optional(),
  time: hhmm.optional(),
  guests: z.number().int().min(1).max(100).optional(),
  seating: z.string().max(40).optional(),
  name: z.string().trim().min(2).max(80).optional(),
  phone: phone.optional(),
});

const url = z.union([z.literal(""), z.string().trim().url().max(300)]);
const feature = z.object({
  title: z.string().trim().max(80),
  text: z.string().trim().max(400),
  image: z.string().max(500),
  enabled: z.boolean(),
  verified: z.boolean(),
});

export const settingsSchema = z.object({
  name: z.string().trim().min(1).max(60),
  tagline: z.string().trim().max(120),
  heroEyebrow: z.string().trim().max(60),
  heroHeadline: z.string().trim().min(1).max(120),
  heroText: z.string().trim().max(400),
  heroImage: z.string().max(500),
  storyHeadline: z.string().trim().max(120),
  storyParagraphs: z.array(z.string().trim().max(800)).max(6),
  storyImages: z.array(z.string().max(500)).max(3),
  address: z.string().trim().max(200),
  plusCode: z.string().trim().max(40),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  phone: z.string().trim().max(30),
  whatsapp: z.string().trim().max(30),
  email: z.union([z.literal(""), z.string().trim().email().max(120)]),
  hours: z
    .array(z.object({ day: z.string().max(12), open: hhmm, close: hhmm, closed: z.boolean() }))
    .length(7),
  hoursNote: z.string().trim().max(200),
  socials: z.object({ instagram: url, tiktok: url, facebook: url }),
  experiences: z.array(feature).max(8),
  craft: z.array(feature).max(6),
  rating: z.object({
    value: z.number().min(0).max(5),
    count: z.number().int().min(0),
    source: z.string().max(40),
    asOf: z.string().max(40),
    show: z.boolean(),
  }),
  reviews: z
    .array(
      z.object({
        author: z.string().trim().min(1).max(60),
        rating: z.number().int().min(1).max(5),
        text: z.string().trim().min(1).max(600),
        date: z.string().max(20),
        source: z.string().trim().max(40),
      }),
    )
    .max(12),
  groupInquiriesEnabled: z.boolean(),
  groupText: z.string().trim().max(500),
  reservationNote: z.string().trim().max(400),
  footerStatement: z.string().trim().max(300),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
