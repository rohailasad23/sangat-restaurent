"use client";

export async function api<T = Record<string, unknown>>(url: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Session expired");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fields = json.fieldErrors ? Object.entries(json.fieldErrors).map(([k, v]) => `${k}: ${v}`).join("; ") : "";
    throw new Error([json.error || `Request failed (${res.status})`, fields].filter(Boolean).join(" — "));
  }
  return json as T;
}

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Upload failed");
  return json.url as string;
}
