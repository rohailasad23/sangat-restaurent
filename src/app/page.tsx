import { getSiteData } from "@/lib/data";
import Contact from "@/components/Contact";
import Craft from "@/components/Craft";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Gatherings from "@/components/Gatherings";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import JsonLd from "@/components/JsonLd";
import MenuBrowser from "@/components/MenuBrowser";
import MotionProvider from "@/components/MotionProvider";
import Nav from "@/components/Nav";
import Reservation from "@/components/Reservation";
import Reviews from "@/components/Reviews";
import ScrollProgress from "@/components/ScrollProgress";
import Signature from "@/components/Signature";
import Story from "@/components/Story";
import Link from "next/link";

export const revalidate = 300;

export default async function Home() {
  const data = await getSiteData();
  const s = data.settings;
  const signature = data.menu.filter((m) => m.signature && m.available);

  return (
    <div className="grain">
      <JsonLd data={data} />
      <Intro name={s.name} />
      <ScrollProgress />
      <MotionProvider />
      <Nav phone={s.phone} />
      <main id="main">
        <Hero eyebrow={s.heroEyebrow} headline={s.heroHeadline} text={s.heroText} image={s.heroImage} tagline={s.tagline} />
        <Story headline={s.storyHeadline} paragraphs={s.storyParagraphs} images={s.storyImages} />
        <Experience features={s.experiences} />
        <Signature dishes={signature} />
        <section id="menu" className="relative py-[clamp(6rem,12vw,10rem)]" aria-labelledby="menu-title">
          <div className="container-x">
            <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="eyebrow" data-reveal>The Menu</p>
                <h2 id="menu-title" className="display mt-6 text-[clamp(2.6rem,5.5vw,5rem)]" data-reveal>From the coals, <em className="text-gold">the karahi &amp; the tandoor.</em></h2>
              </div>
              <Link href="/menu" className="btn btn-ghost shrink-0" data-reveal>View Full Menu</Link>
            </div>
            <MenuBrowser categories={data.categories} items={data.menu} compact />
          </div>
        </section>
        <Craft steps={s.craft} />
        <Gallery images={data.gallery} />
        <Reviews settings={s} />
        <Gatherings text={s.groupText} enabled={s.groupInquiriesEnabled} />
        <Reservation note={s.reservationNote} whatsapp={s.whatsapp} phone={s.phone} />
        <Contact s={s} />
      </main>
      <Footer s={s} />
    </div>
  );
}
