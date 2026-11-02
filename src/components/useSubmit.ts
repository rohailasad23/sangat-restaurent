"use client";

import { useRef, useState } from "react";

export type SubmitState = { status: "idle" | "loading" | "success" | "error"; message?: string; errors: Record<string, string>; data?: Record<string, unknown> };

/** Posts JSON, tracks loading/success/error, and blocks double submissions. */
export function useSubmit(url: string) {
  const [state, setState] = useState<SubmitState>({ status: "idle", errors: {} });
  const inflight = useRef(false);
  const key = useRef<string>("");

  async function submit(body: Record<string, unknown>) {
    if (inflight.current) return;
    inflight.current = true;
    if (!key.current) key.current = crypto.randomUUID();
    setState({ status: "loading", errors: {} });
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key.current }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ status: "error", message: json.error || "Something went wrong. Please try again.", errors: json.fieldErrors || {} });
      } else {
        key.current = "";
        setState({ status: "success", errors: {}, data: json });
      }
    } catch {
      setState({ status: "error", message: "Network error. Please check your connection and try again.", errors: {} });
    } finally {
      inflight.current = false;
    }
  }

  return { state, submit, reset: () => setState({ status: "idle", errors: {} }) };
}
