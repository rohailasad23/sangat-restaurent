import "server-only";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import type { z } from "zod";
import { isResponse, requireAdmin } from "./auth";
import { connectDB } from "./db";
import { fieldErrors } from "./validation";

type Handler<T> = (ctx: { req: Request; id?: string }) => Promise<T>;

/** Wraps an admin route: authenticates, connects, validates ids and turns thrown errors into JSON. */
export function adminRoute<T>(fn: Handler<T>) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }) => {
    const admin = await requireAdmin();
    if (isResponse(admin)) return admin;
    const params = ctx?.params ? await ctx.params : {};
    const id = params.id;
    if (id !== undefined && !isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    // CSRF defence in depth: cookies are SameSite=Strict, and mutating requests must be same-origin.
    if (req.method !== "GET") {
      const origin = req.headers.get("origin");
      const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
      if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
    }
    try {
      await connectDB();
      const result = await fn({ req, id });
      return result instanceof Response ? result : NextResponse.json(result ?? { ok: true });
    } catch (err) {
      if (err instanceof HttpError) return NextResponse.json({ error: err.message, fieldErrors: err.fields }, { status: err.status });
      if ((err as { code?: number }).code === 11000) return NextResponse.json({ error: "That value already exists" }, { status: 409 });
      console.error("[admin]", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  };
}

export class HttpError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string>) {
    super(message);
  }
}

export async function parseBody<S extends z.ZodType>(req: Request, schema: S): Promise<z.infer<S>> {
  const body = await req.json().catch(() => null);
  const r = schema.safeParse(body);
  if (!r.success) throw new HttpError(400, "Please check the highlighted fields.", fieldErrors(r.error));
  return r.data;
}

/**
 * For PATCH: validates like parseBody but keeps only the keys the client actually sent,
 * so schema defaults never overwrite fields that were not part of the update.
 */
export async function parsePatch<S extends z.ZodType>(req: Request, schema: S): Promise<Partial<z.infer<S>>> {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new HttpError(400, "Invalid request body");
  const r = schema.safeParse(body);
  if (!r.success) throw new HttpError(400, "Please check the highlighted fields.", fieldErrors(r.error));
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(body)) if (k in (r.data as object)) out[k] = (r.data as Record<string, unknown>)[k];
  return out as Partial<z.infer<S>>;
}

export function refreshSite() {
  revalidatePath("/");
  revalidatePath("/menu");
}

export function serialize<T extends { _id: unknown }>(doc: T) {
  const { _id, ...rest } = doc as T & Record<string, unknown>;
  return { id: String(_id), ...rest };
}
