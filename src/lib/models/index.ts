import mongoose, { Schema, type Model } from "mongoose";
import { GALLERY_CATEGORIES, RESERVATION_STATUSES } from "../types";

function model<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema);
}

const opts = { timestamps: true } as const;

export interface SettingsDoc { key: string; data: Record<string, unknown> }
export const SettingsModel = model<SettingsDoc>(
  "Settings",
  new Schema<SettingsDoc>({ key: { type: String, unique: true, required: true }, data: { type: Schema.Types.Mixed, default: {} } }, opts),
);

export interface CategoryDoc { name: string; slug: string; description: string; order: number }
export const CategoryModel = model<CategoryDoc>(
  "Category",
  new Schema<CategoryDoc>(
    {
      name: { type: String, required: true, trim: true, maxlength: 60 },
      slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
      description: { type: String, default: "", maxlength: 200 },
      order: { type: Number, default: 0 },
    },
    opts,
  ),
);

export interface MenuItemDoc {
  name: string; description: string; price: number | null; category: string; image: string;
  available: boolean; signature: boolean; dietary: string[]; spice: number; order: number;
}
export const MenuItemModel = model<MenuItemDoc>(
  "MenuItem",
  new Schema<MenuItemDoc>(
    {
      name: { type: String, required: true, trim: true, maxlength: 100 },
      description: { type: String, default: "", maxlength: 400 },
      price: { type: Number, default: null, min: 0 },
      category: { type: String, required: true, index: true },
      image: { type: String, default: "" },
      available: { type: Boolean, default: true },
      signature: { type: Boolean, default: false },
      dietary: { type: [String], default: [] },
      spice: { type: Number, default: 0, min: 0, max: 3 },
      order: { type: Number, default: 0 },
    },
    opts,
  ),
);

export interface GalleryDoc { url: string; alt: string; caption: string; category: string; order: number }
export const GalleryModel = model<GalleryDoc>(
  "GalleryImage",
  new Schema<GalleryDoc>(
    {
      url: { type: String, required: true },
      alt: { type: String, required: true, maxlength: 200 },
      caption: { type: String, default: "", maxlength: 300 },
      category: { type: String, enum: GALLERY_CATEGORIES, default: "restaurant" },
      order: { type: Number, default: 0 },
    },
    opts,
  ),
);

export interface ReservationDoc {
  name: string; phone: string; email: string; date: string; time: string; guests: number;
  seating: string; requests: string; status: (typeof RESERVATION_STATUSES)[number];
  notes: string; dedupeKey: string; createdAt: Date; updatedAt: Date;
}
export const ReservationModel = model<ReservationDoc>(
  "Reservation",
  new Schema<ReservationDoc>(
    {
      name: { type: String, required: true, maxlength: 80 },
      phone: { type: String, required: true, maxlength: 20 },
      email: { type: String, default: "", maxlength: 120 },
      date: { type: String, required: true, index: true },
      time: { type: String, required: true },
      guests: { type: Number, required: true, min: 1, max: 100 },
      seating: { type: String, default: "no-preference" },
      requests: { type: String, default: "", maxlength: 600 },
      status: { type: String, enum: RESERVATION_STATUSES, default: "pending", index: true },
      notes: { type: String, default: "", maxlength: 2000 },
      dedupeKey: { type: String, required: true, unique: true },
    },
    opts,
  ),
);

export interface InquiryDoc {
  kind: "contact" | "group"; name: string; phone: string; email: string; message: string;
  guests: number | null; date: string; occasion: string; status: "new" | "read" | "archived"; createdAt: Date;
}
export const InquiryModel = model<InquiryDoc>(
  "Inquiry",
  new Schema<InquiryDoc>(
    {
      kind: { type: String, enum: ["contact", "group"], default: "contact" },
      name: { type: String, required: true, maxlength: 80 },
      phone: { type: String, default: "", maxlength: 20 },
      email: { type: String, default: "", maxlength: 120 },
      message: { type: String, required: true, maxlength: 2000 },
      guests: { type: Number, default: null },
      date: { type: String, default: "" },
      occasion: { type: String, default: "", maxlength: 80 },
      status: { type: String, enum: ["new", "read", "archived"], default: "new", index: true },
    },
    opts,
  ),
);

export interface AdminUserDoc { email: string; name: string; passwordHash: string; lastLoginAt: Date | null }
export const AdminUserModel = model<AdminUserDoc>(
  "AdminUser",
  new Schema<AdminUserDoc>(
    {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      name: { type: String, default: "Admin" },
      passwordHash: { type: String, required: true, select: false },
      lastLoginAt: { type: Date, default: null },
    },
    opts,
  ),
);

export interface MediaDoc { filename: string; contentType: string; size: number; data: Buffer }
export const MediaModel = model<MediaDoc>(
  "Media",
  new Schema<MediaDoc>(
    {
      filename: { type: String, default: "upload" },
      contentType: { type: String, required: true },
      size: { type: Number, required: true },
      data: { type: Buffer, required: true, select: false },
    },
    opts,
  ),
);

export interface ActivityDoc { action: string; detail: string; createdAt: Date }
export const ActivityModel = model<ActivityDoc>(
  "Activity",
  new Schema<ActivityDoc>({ action: { type: String, required: true }, detail: { type: String, default: "" } }, opts),
);

export async function logActivity(action: string, detail = ""): Promise<void> {
  try {
    await ActivityModel.create({ action, detail: detail.slice(0, 300) });
  } catch {
    /* activity log is best effort */
  }
}
