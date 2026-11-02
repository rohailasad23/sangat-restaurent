"use client";

import { useEffect, useRef, useState } from "react";

/** Loads the Google Maps iframe only when it scrolls near the viewport. */
export default function MapEmbed({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setLoad(true); io.disconnect(); } }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative h-full min-h-[22rem] w-full overflow-hidden bg-ember">
      {load ? (
        <iframe src={src} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0 [filter:grayscale(0.85)_invert(0.92)_contrast(0.9)_sepia(0.15)]" allowFullScreen />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-sm text-mute">Loading map…</div>
      )}
    </div>
  );
}
