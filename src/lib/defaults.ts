import type { Category, MenuItem, SiteSettings } from "./types";

/**
 * Default content. Everything here comes from the research report (RESEARCH.md).
 * Prices are intentionally null ("Price on request") because no price could be verified.
 * The owner replaces all of this through the admin panel.
 */
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const DEFAULT_SETTINGS: SiteSettings = {
  name: "Sangat",
  tagline: "A Taste of Tradition.",
  heroEyebrow: "Multan, Pakistan",
  heroHeadline: "Where Tradition\nMeets Togetherness",
  heroText:
    "Experience the warmth of traditional Pakistani hospitality, authentic desi flavors, and memorable evenings at Sangat Restaurant Multan.",
  heroImage: "",
  storyHeadline: "More Than a Meal.\nA Gathering of Souls.",
  storyParagraphs: [
    "Sangat means companionship: the company of the people you choose to sit beside. It is the oldest idea in desi hospitality, and the reason a table here is never just a table.",
    "Evenings unfold on an open lawn, under a wide Multan sky. Charcoal glows, karahi sizzles, and conversation stretches long past the last round of chai.",
    "Families gather, friends linger, and plates are passed from hand to hand. Food is meant to be shared, and here it always is.",
  ],
  storyImages: ["", "", ""],
  address: "Northern Bypass Road, opposite NCBA&E Campus, Multan, Punjab, Pakistan",
  plusCode: "6GQP+XQ Multan",
  lat: 30.2399957,
  lng: 71.5369656,
  phone: "+92 345 8933300",
  whatsapp: "",
  email: "",
  hours: days.map((day) => ({ day, open: "17:00", close: "02:00", closed: false })),
  hoursNote: "Hours as listed on public directories. Please call ahead to confirm.",
  socials: {
    instagram: "https://www.instagram.com/sangatforlife/",
    tiktok: "https://www.tiktok.com/@sangatrestaurant",
    facebook: "",
  },
  experiences: [
    {
      title: "The Open Lawn",
      text: "Dinner beneath the sky, on a green lawn that comes alive after sunset, best of all on a cool winter evening.",
      image: "",
      enabled: true,
      verified: true,
    },
    {
      title: "Charpai Seating",
      text: "Woven charpais and low tables, the way gatherings have always been hosted across Punjab.",
      image: "",
      enabled: true,
      verified: false,
    },
    {
      title: "Family Sitting Areas",
      text: "Room for every generation, from grandparents to little ones, with space set aside for families.",
      image: "",
      enabled: true,
      verified: false,
    },
    {
      title: "Evenings of BBQ",
      text: "Malai boti and kebabs off the coals, the dishes guests mention most.",
      image: "",
      enabled: true,
      verified: true,
    },
    {
      title: "Live Music",
      text: "Music on selected evenings.",
      image: "",
      enabled: false,
      verified: false,
    },
  ],
  craft: [
    { title: "Over the Coals", text: "Skewers turned slowly until the edges catch and the smoke rises.", image: "", enabled: true, verified: false },
    { title: "In the Karahi", text: "Tomatoes, ginger and green chillies, worked in the wok until the oil separates.", image: "", enabled: true, verified: false },
    { title: "From the Tandoor", text: "Breads pulled hot and blistered, made to tear and share.", image: "", enabled: true, verified: false },
  ],
  rating: { value: 4.0, count: 352, source: "Google", asOf: "November 2026", show: true },
  reviews: [
    {
      author: "Muhammad J.",
      rating: 4,
      text: "The Malai Boti and Kebabs were juicy and the Afghani Pulau was delicious.",
      date: "2024-11-01",
      source: "Google",
    },
    {
      author: "Zargham K.",
      rating: 5,
      text: "I enjoyed the place and its ambiance, especially during the winter season.",
      date: "2023-07-06",
      source: "Google",
    },
    {
      author: "Wajahat J.",
      rating: 5,
      text: "Sangat restaurant in Multan is a must-visit spot for anyone who loves authentic Pakistani cuisine.",
      date: "2023-03-10",
      source: "Google",
    },
  ],
  groupInquiriesEnabled: true,
  groupText:
    "Planning an evening for a big family or a circle of friends? Tell us the date and how many are coming, and our team will call you back to arrange it.",
  reservationNote:
    "Reservations are requests. Our team confirms every booking by phone or WhatsApp. Submitting this form does not guarantee a table.",
  footerStatement: "Traditional desi hospitality on the Northern Bypass, Multan. Pull up a seat, there is always room for one more.",
};

export const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  { name: "BBQ", slug: "bbq", description: "From the coals", order: 1 },
  { name: "Karahi", slug: "karahi", description: "Cooked to order in the wok", order: 2 },
  { name: "Handi", slug: "handi", description: "Slow, rich and comforting", order: 3 },
  { name: "Rice", slug: "rice", description: "Pulao and more", order: 4 },
  { name: "Breads", slug: "breads", description: "Fresh from the tandoor", order: 5 },
  { name: "Beverages", slug: "beverages", description: "Chai, lassi and more", order: 6 },
  { name: "Desserts", slug: "desserts", description: "Something sweet", order: 7 },
];

type SeedItem = Omit<MenuItem, "id" | "image" | "available" | "dietary" | "order"> & { dietary?: string[] };

/** Dish names come from directory listings and verbatim reviews. Descriptions are generic and editable. */
const seed: SeedItem[] = [
  { name: "Malai Boti", description: "Creamy, tender chicken pieces grilled over charcoal.", price: null, category: "bbq", signature: true, spice: 1 },
  { name: "Seekh Kebab", description: "Spiced minced meat kebabs, charred on skewers.", price: null, category: "bbq", signature: true, spice: 2 },
  { name: "Chicken Tikka", description: "Marinated chicken on the bone, roasted over the coals.", price: null, category: "bbq", signature: false, spice: 2 },
  { name: "Chicken Karahi", description: "Chicken cooked in the wok with tomato, ginger and green chilli.", price: null, category: "karahi", signature: true, spice: 2 },
  { name: "Mutton Karahi", description: "Mutton cooked in the wok with tomato, ginger and green chilli.", price: null, category: "karahi", signature: true, spice: 2 },
  { name: "Handi", description: "A slow-cooked handi, finished with cream and fresh coriander.", price: null, category: "handi", signature: false, spice: 1 },
  { name: "Afghani Pulao", description: "Fragrant rice with meat, carrots and raisins.", price: null, category: "rice", signature: true, spice: 0 },
  { name: "Roti", description: "Whole-wheat flatbread from the tandoor.", price: null, category: "breads", signature: false, spice: 0, dietary: ["vegetarian"] },
  { name: "Naan", description: "Soft, blistered tandoori naan.", price: null, category: "breads", signature: false, spice: 0, dietary: ["vegetarian"] },
  { name: "Paratha", description: "Flaky layered flatbread.", price: null, category: "breads", signature: false, spice: 0, dietary: ["vegetarian"] },
  { name: "Lassi", description: "Chilled yoghurt drink, sweet or salted.", price: null, category: "beverages", signature: false, spice: 0, dietary: ["vegetarian"] },
  { name: "Doodh Patti Chai", description: "Milky tea brewed strong, for long evenings.", price: null, category: "beverages", signature: false, spice: 0, dietary: ["vegetarian"] },
  { name: "Gulab Jamun", description: "Milk dumplings soaked in syrup.", price: null, category: "desserts", signature: false, spice: 0, dietary: ["vegetarian"] },
];

export const DEFAULT_MENU: Omit<MenuItem, "id">[] = seed.map((s, i) => ({
  ...s,
  image: "",
  available: true,
  dietary: s.dietary ?? [],
  order: i + 1,
}));
