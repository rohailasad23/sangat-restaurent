"use client";

import { useState } from "react";
import { uploadImage } from "./api";

export default function ImageField({ value, onChange, label = "Image" }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div>
      <p className="mb-1.5 text-xs text-sand">{label}</p>
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded border border-line bg-ember">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : <span className="grid h-full place-items-center text-[0.6rem] text-mute">None</span>}
        </div>
        <label className="admin-btn cursor-pointer">
          {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={busy}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setBusy(true); setErr("");
              try { onChange(await uploadImage(f)); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
            }} />
        </label>
        {value && <button type="button" className="admin-btn" onClick={() => onChange("")}>Remove</button>}
      </div>
      {err && <p className="mt-1 text-xs text-[#f0a48f]">{err}</p>}
    </div>
  );
}
