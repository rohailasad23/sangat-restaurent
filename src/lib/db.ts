import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = globalThis as unknown as { __mongoose?: Cache };
const cache: Cache = g.__mongoose ?? (g.__mongoose = { conn: null, promise: null });

export function hasDatabase(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 5000 })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
