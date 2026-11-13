/** Desktop wallpapers: a solid colour plus a quiet texture. "dark" flips desktop label colours. */
export const WALLPAPERS = [
  { id: "meadow", name: "meadow", bg: "#b5d3a8", pattern: "radial-gradient(#a3c495 1.2px, transparent 1.4px) 0 0 / 14px 14px", dark: false },
  { id: "sky", name: "sky", bg: "#b6cdf0", pattern: "radial-gradient(#a5bde4 1.2px, transparent 1.4px) 0 0 / 14px 14px", dark: false },
  { id: "paper", name: "graph paper", bg: "#efeadf", pattern: "linear-gradient(#e0d9ca 1px, transparent 1px) 0 0 / 22px 22px, linear-gradient(90deg, #e0d9ca 1px, transparent 1px) 0 0 / 22px 22px", dark: false },
  { id: "dusk", name: "dusk", bg: "#f2b58c", pattern: "radial-gradient(#e8a379 1.2px, transparent 1.4px) 0 0 / 14px 14px", dark: false },
  { id: "night", name: "night", bg: "#252a45", pattern: "radial-gradient(#3b4166 1.2px, transparent 1.4px) 0 0 / 18px 18px, radial-gradient(#6c7398 1px, transparent 1.3px) 7px 9px / 61px 47px", dark: true },
] as const;

export type WallpaperId = (typeof WALLPAPERS)[number]["id"] | "sketch";
