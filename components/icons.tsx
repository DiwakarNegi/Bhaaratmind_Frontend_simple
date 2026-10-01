import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export function ArrowRight(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base(p)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** BhaaratMind nav mark — the exact Figma logo (161:136): saffron rounded square + cream disc */
export function BrandGlyph(p: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 28 28"
      width="28"
      height="28"
      aria-hidden="true"
      focusable="false"
      {...p}
    >
      <rect width="28" height="28" rx="8" fill="#e4742b" />
      <circle cx="14" cy="14" r="6" fill="#fbf5ec" />
    </svg>
  );
}
