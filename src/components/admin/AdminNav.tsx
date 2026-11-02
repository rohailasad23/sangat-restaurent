"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/content", label: "Website content" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export default function AdminNav({ email }: { email: string }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="border-b border-line bg-coal md:sticky md:top-0 md:h-svh md:w-60 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between p-5">
        <Link href="/admin" className="display text-2xl tracking-[0.2em]">SANGAT</Link>
        <button className="admin-btn md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="admin-nav">Menu</button>
      </div>
      <nav id="admin-nav" aria-label="Admin" className={`${open ? "block" : "hidden"} px-3 pb-5 md:block`}>
        <ul className="space-y-1">
          {items.map((i) => {
            const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
            return (
              <li key={i.href}>
                <Link href={i.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
                  className={`block rounded px-3 py-2 text-sm ${active ? "bg-ember text-gold" : "text-sand hover:bg-ember hover:text-ivory"}`}>{i.label}</Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 border-t border-line px-3 pt-5 text-xs text-mute">
          <p className="truncate">{email}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/" target="_blank" className="admin-btn">View site ↗</Link>
            <button onClick={logout} className="admin-btn">Log out</button>
          </div>
        </div>
      </nav>
    </aside>
  );
}
