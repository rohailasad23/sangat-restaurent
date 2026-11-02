import { adminRoute, HttpError } from "@/lib/admin-api";
import { MediaModel } from "@/lib/models";

const MAX_BYTES = 4 * 1024 * 1024;

/** Detects the real image type from magic bytes rather than trusting the browser. */
function sniff(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 && b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69) return "image/avif";
  return null;
}

export const POST = adminRoute(async ({ req }) => {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "No file uploaded");
  if (file.size > MAX_BYTES) throw new HttpError(413, "Images must be 4 MB or smaller. Please resize and try again.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type) throw new HttpError(415, "Only JPEG, PNG, WebP or AVIF images are allowed.");
  const doc = await MediaModel.create({ filename: file.name.slice(0, 120), contentType: type, size: bytes.byteLength, data: Buffer.from(bytes) });
  return { url: `/api/media/${doc._id}` };
});
