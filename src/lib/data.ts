import "server-only";
import { connectDB, hasDatabase } from "./db";
import { DEFAULT_CATEGORIES, DEFAULT_MENU, DEFAULT_SETTINGS } from "./defaults";
import { CategoryModel, GalleryModel, MenuItemModel, SettingsModel } from "./models";
import type { Category, GalleryCategory, GalleryImage, MenuItem, SiteData, SiteSettings } from "./types";

export function mergeSettings(stored: Partial<SiteSettings> | undefined): SiteSettings {
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}), socials: { ...DEFAULT_SETTINGS.socials, ...(stored?.socials ?? {}) }, rating: { ...DEFAULT_SETTINGS.rating, ...(stored?.rating ?? {}) } };
}

export async function getSettings(): Promise<SiteSettings> {
  await connectDB();
  const doc = await SettingsModel.findOne({ key: "site" }).lean();
  return mergeSettings(doc?.data as Partial<SiteSettings> | undefined);
}

function defaults(): SiteData {
  return {
    settings: DEFAULT_SETTINGS,
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, id: c.slug })),
    menu: DEFAULT_MENU.map((m, i) => ({ ...m, id: `default-${i}` })),
    gallery: [],
    source: "defaults",
  };
}

/** Loads all public content. Falls back to research defaults when no database is configured or reachable. */
export async function getSiteData(): Promise<SiteData> {
  if (!hasDatabase()) return defaults();
  try {
    await connectDB();
    const [settingsDoc, cats, items, images] = await Promise.all([
      SettingsModel.findOne({ key: "site" }).lean(),
      CategoryModel.find().sort({ order: 1, name: 1 }).lean(),
      MenuItemModel.find().sort({ order: 1, name: 1 }).lean(),
      GalleryModel.find().sort({ order: 1, createdAt: -1 }).lean(),
    ]);
    if (!settingsDoc && cats.length === 0 && items.length === 0) return defaults();
    const categories: Category[] = cats.map((c) => ({ id: String(c._id), name: c.name, slug: c.slug, description: c.description, order: c.order }));
    const menu: MenuItem[] = items.map((m) => ({
      id: String(m._id), name: m.name, description: m.description, price: m.price ?? null, category: m.category,
      image: m.image, available: m.available, signature: m.signature, dietary: m.dietary ?? [], spice: m.spice ?? 0, order: m.order,
    }));
    const gallery: GalleryImage[] = images.map((g) => ({
      id: String(g._id), url: g.url, alt: g.alt, caption: g.caption, category: g.category as GalleryCategory, order: g.order,
    }));
    return { settings: mergeSettings(settingsDoc?.data as Partial<SiteSettings> | undefined), categories, menu, gallery, source: "database" };
  } catch (err) {
    console.error("[sangat] database unavailable, serving defaults:", (err as Error).message);
    return defaults();
  }
}
