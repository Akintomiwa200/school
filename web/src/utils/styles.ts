/** Tailwind 4 class maps — use with `cn()` for programmatic styling */

export const typographyClasses = {
  "display-xl": "font-display text-display-xl uppercase",
  "display-lg": "font-display text-display-lg uppercase",
  "display-md": "font-display text-display-md",
  "heading-lg": "font-display text-heading-lg",
  "heading-sm": "font-display text-heading-sm",
  "body-lg": "text-body-lg",
  body: "text-body",
  "link-lg": "type-link-lg",
  link: "type-link",
  "link-sm": "type-link-sm",
} as const;

export const surfaceClasses = {
  canvas: "bg-canvas text-ink",
  "surface-indigo": "bg-surface-indigo text-ink",
  "surface-onyx": "bg-surface-onyx text-ink",
  "surface-black": "bg-surface-black text-ink",
  "feature-dark": "rounded-xl bg-surface-indigo p-xxl text-ink",
  "feature-gradient": "rounded-xl bg-magenta p-section text-ink",
  stat: "rounded-xl bg-primary p-xxl text-ink",
  "cta-band": "rounded-xl bg-primary p-section text-ink",
  "showcase-band": "rounded-xl bg-surface-black p-section text-ink",
} as const;

export const buttonClasses = {
  primary: "bg-primary text-primary-foreground rounded-sm px-xl py-lg type-link-lg font-medium",
  green: "bg-green text-ink-dark rounded-sm px-xl py-sm type-link-lg font-medium",
  white: "bg-ink text-ink-dark rounded-lg px-md py-xs type-link font-medium",
  ghost: "bg-surface-indigo text-ink rounded-lg p-md type-link font-medium",
  "ghost-sm": "bg-surface-indigo text-ink rounded-xs px-xxl py-sm type-link-sm font-medium",
} as const;

export type TypographyClassKey = keyof typeof typographyClasses;
export type SurfaceClassKey = keyof typeof surfaceClasses;
export type ButtonClassKey = keyof typeof buttonClasses;
