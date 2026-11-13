import type { ReactNode } from "react";

/** goodstuff os 2 icons: soft coloured tiles for apps, plain shapes for files and junk. */
export type IconName =
  | "hangs" | "todo" | "dropin" | "garden" | "sketch" | "prefs" | "about"
  | "readme" | "doomscroll" | "trash" | "trash-full" | "spec" | "sticky";

const ink = "#1c1b19";
const line = { stroke: ink, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

function Tile({ color, children }: { color: string; children: ReactNode }) {
  return (
    <>
      <rect x="4" y="5" width="40" height="40" rx="11" fill={ink} opacity="0.18" />
      <rect x="4" y="3" width="40" height="40" rx="11" fill={color} stroke={ink} strokeWidth="2" />
      <path d="M11 8h26" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
      {children}
    </>
  );
}

export function Icon({ name, size = 48 }: { name: IconName; size?: number }) {
  return (
    <svg className="o2-ico" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {glyph(name)}
    </svg>
  );
}

function glyph(name: IconName) {
  switch (name) {
    case "hangs":
      return (
        <Tile color="#ff8c66">
          <circle cx="18" cy="20" r="4.5" fill="#fff8ee" stroke={ink} strokeWidth="2" />
          <circle cx="30" cy="20" r="4.5" fill="#fff8ee" stroke={ink} strokeWidth="2" />
          <path d="M10 35c1.5-5 4.5-7 8-7s6.5 2 8 7M22 35c1.5-5 4.5-7 8-7s6.5 2 8 7" {...line} />
        </Tile>
      );
    case "todo":
      return (
        <Tile color="#ffd23f">
          <path d="M13 16l3 3 5-6M13 27l3 3 5-6" {...line} />
          <path d="M25 16h10M25 27h10M13 36h22" {...line} />
        </Tile>
      );
    case "dropin":
      return (
        <Tile color="#7fcfae">
          <path d="M24 35s-8-7-8-14a8 8 0 0116 0c0 7-8 14-8 14z" fill="#fff8ee" stroke={ink} strokeWidth="2" />
          <circle cx="24" cy="21" r="3" fill={ink} />
        </Tile>
      );
    case "garden":
      return (
        <Tile color="#a5d67f">
          <path d="M10 35h28" {...line} />
          <path d="M24 35V20" {...line} />
          <path d="M24 26c-5 0-8-3-8-7 5 0 8 3 8 7zM24 23c5 0 8-3 8-7-5 0-8 3-8 7z" fill="#fff8ee" stroke={ink} strokeWidth="2" />
          <circle cx="24" cy="15" r="3" fill="#ff8c66" stroke={ink} strokeWidth="2" />
        </Tile>
      );
    case "sketch":
      return (
        <Tile color="#9fb4ff">
          <path d="M12 33c4-8 8 2 12-6s8 0 12-4" {...line} />
          <path d="M30 11l7 7-11 11h-7v-7z" fill="#fff8ee" stroke={ink} strokeWidth="2" />
        </Tile>
      );
    case "prefs":
      return (
        <Tile color="#d6d1c4">
          <path d="M12 15h24M12 24h24M12 33h24" {...line} />
          <circle cx="28" cy="15" r="3.5" fill="#ffd23f" stroke={ink} strokeWidth="2" />
          <circle cx="18" cy="24" r="3.5" fill="#fff8ee" stroke={ink} strokeWidth="2" />
          <circle cx="31" cy="33" r="3.5" fill="#fff8ee" stroke={ink} strokeWidth="2" />
        </Tile>
      );
    case "about":
    case "spec":
      return (
        <Tile color="#1c1b19">
          <text x="24" y="31" textAnchor="middle" fontFamily="Instrument Sans Variable, sans-serif" fontWeight="700" fontSize="22" fill="#ffd23f">g</text>
        </Tile>
      );
    case "readme":
      return (
        <>
          <path d="M12 5h17l9 9v29H12z" fill="#fffdf6" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
          <path d="M29 5v9h9" {...line} />
          <path d="M17 21h15M17 27h15M17 33h10" {...line} strokeWidth="1.6" />
        </>
      );
    case "doomscroll":
      return (
        <>
          <rect x="14" y="4" width="20" height="40" rx="4" fill="#2b2a28" stroke={ink} strokeWidth="2" />
          <rect x="17" y="9" width="14" height="28" rx="1" fill="#57544e" />
          <path d="M20 23c0-2 3-2 4 0s4 2 4 0-3-2-4 0-4 2-4 0z" stroke="#ff5a36" strokeWidth="1.8" fill="none" />
          <path d="M20 14h8M20 17h6M20 30h8M20 33h5" stroke="#8d897f" strokeWidth="1.4" />
        </>
      );
    case "trash":
    case "trash-full":
      return (
        <>
          {name === "trash-full" && (
            <path d="M16 13c0-4 4-5 5-2 2-4 7-3 7 0 3-2 6 1 4 3" fill="#fffdf6" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
          )}
          <path d="M11 14h26" {...line} />
          <path d="M14 14l2.5 28h15L34 14" fill="#e7e4dc" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
          <path d="M21 20v16M27 20v16" {...line} strokeWidth="1.6" />
        </>
      );
    case "sticky":
      return (
        <>
          <path d="M8 8h32v24l-8 8H8z" fill="#ffe680" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 40v-8h8" {...line} />
        </>
      );
  }
}
