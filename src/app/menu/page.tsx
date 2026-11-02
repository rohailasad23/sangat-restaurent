import type { Metadata } from "next";
import Link from "next/link";
import { getSiteData } from "@/lib/data";
import Footer from "@/components/Footer";
import MenuBrowser from "@/components/MenuBrowser";
import Nav from "@/components/Nav";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Menu",
  description: "The full Sangat Restaurant Multan menu: BBQ, karahi, handi, rice, breads, beverages and desserts.",
  alternates: { canonical: "/menu" },
};

export default async function MenuPage() {
  const data = await getSiteData();
  return (
    <>
      <Nav phone={data.settings.phone} onHome={false} />
      <main id="main" className="pb-24 pt-36">
        <div className="container-x">
          <Link href="/" className="link-line text-xs font-semibold uppercase tracking-[0.2em] text-sand">← Back to home</Link>
          <p className="eyebrow mt-12">Sangat · Full Menu</p>
          <h1 className="display mt-6 text-[clamp(3rem,8vw,7rem)]">The Menu</h1>
          <p className="mt-6 max-w-xl text-sand">Prices in Pakistani Rupees. Availability may vary by evening; our team will happily guide you.</p>
          <div className="mt-16"><MenuBrowser categories={data.categories} items={data.menu} /></div>
          <div className="mt-20 flex flex-wrap gap-4">
            <Link href="/#reserve" className="btn btn-gold">Reserve a Table</Link>
            <a href={`tel:${data.settings.phone.replace(/[^0-9+]/g, "")}`} className="btn btn-ghost">Call {data.settings.phone}</a>
          </div>
        </div>
      </main>
      <Footer s={data.settings} onHome={false} />
    </>
  );
}
