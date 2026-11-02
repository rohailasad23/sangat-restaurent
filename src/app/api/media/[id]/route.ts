import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { MediaModel } from "@/lib/models";

function toBuffer(data: unknown): Buffer {
  if (Buffer.isBuffer(data)) return data;
  const d = data as { buffer?: unknown; value?: () => Uint8Array };
  if (d && typeof d.value === "function") return Buffer.from(d.value());
  if (d && d.buffer instanceof Uint8Array) return Buffer.from(d.buffer);
  return Buffer.from(data as Uint8Array);
}

/** Serves images uploaded through the admin panel. Uploads are immutable, so they cache for a year. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) return new Response("Not found", { status: 404 });
  try {
    await connectDB();
    const doc = await MediaModel.findById(id).select("+data").lean();
    if (!doc) return new Response("Not found", { status: 404 });
    const buf = toBuffer(doc.data);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": doc.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
