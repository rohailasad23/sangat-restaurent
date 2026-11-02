import Image from "next/image";

const tones = {
  ember: "radial-gradient(120% 90% at 30% 80%, #5a3a24 0%, #2a1d14 45%, #121210 100%)",
  lawn: "radial-gradient(120% 100% at 70% 90%, #3b4029 0%, #1d2016 50%, #0f100d 100%)",
  dusk: "radial-gradient(130% 100% at 50% 100%, #6a4a36 0%, #2f2219 45%, #0f0f0d 100%)",
  clay: "radial-gradient(110% 90% at 20% 20%, #7a4a2e 0%, #3a2418 50%, #141210 100%)",
  smoke: "radial-gradient(120% 100% at 50% 30%, #3a3830 0%, #1c1b17 55%, #0e0f0d 100%)",
} as const;
const JAALI = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><path d="M28 4 L52 28 L28 52 L4 28 Z M28 16 L40 28 L28 40 L16 28 Z" fill="none" stroke="#f3ebdd" stroke-width="0.8"/><circle cx="28" cy="28" r="2" fill="#f3ebdd"/></svg>')}")`;

export type Tone = keyof typeof tones;

type Props = {
  src?: string;
  alt: string;
  label?: string;
  tone?: Tone;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
};

/**
 * Renders an uploaded photograph, or a clearly labelled placeholder until the restaurant's
 * real photography is uploaded through the admin panel. Placeholders never imitate real photos.
 */
export default function Media({ src, alt, label, tone = "ember", sizes = "100vw", priority, className = "", imgClassName = "" }: Props) {
  const position = /(^|\s)(absolute|fixed)(\s|$)/.test(className) ? "" : "relative";
  return (
    <div className={`${position} overflow-hidden bg-coal ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${imgClassName}`} />
      ) : (
        <div role="img" aria-label={`${alt} (photograph coming soon)`} className={`absolute inset-0 ${imgClassName}`} style={{ background: tones[tone] }}>
          <div aria-hidden className="absolute inset-0 opacity-[0.09]" style={{ backgroundImage: JAALI, backgroundSize: "56px 56px" }} />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_100%,rgba(194,164,108,0.18),transparent)]" />
          {label && (
            <span aria-hidden className="absolute bottom-4 left-4 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-ivory/45">
              Photo coming soon · {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
