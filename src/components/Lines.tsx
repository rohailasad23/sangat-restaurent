import type { ElementType } from "react";

/** Splits text on "\n" into masked lines for the data-lines reveal. Plain text without JS. */
export default function Lines({ text, as: Tag = "h2", className = "", id }: { text: string; as?: ElementType; className?: string; id?: string }) {
  return (
    <Tag className={className} data-lines id={id}>
      {text.split("\n").map((line, i) => (
        <span key={i} data-line className="block overflow-hidden pb-[0.08em]">
          <span className="block will-change-transform">{line}</span>
        </span>
      ))}
    </Tag>
  );
}
