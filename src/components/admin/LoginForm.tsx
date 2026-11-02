"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    }).catch(() => null);
    const json = await res?.json().catch(() => ({}));
    setLoading(false);
    if (!res?.ok) return setError(json?.error || "Login failed");
    const next = params.get("next");
    router.replace(next && next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs text-sand">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="admin-input" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs text-sand">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="admin-input" />
      </div>
      {error && <p role="alert" className="text-sm text-[#f0a48f]">{error}</p>}
      <button disabled={loading} className="admin-btn admin-btn-primary w-full justify-center py-2.5">{loading ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

export default function LoginForm() {
  return <Suspense><Form /></Suspense>;
}
