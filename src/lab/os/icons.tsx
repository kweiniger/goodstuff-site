/** Hand-drawn desktop icons: one ink line weight, paper fill, a single accent. */
export type IconName = "hangs" | "todo" | "dropin" | "readme" | "settings" | "ideas" | "trash" | "trash-empty";

const ink = "var(--os-ink)";
const paper = "var(--os-paper)";
const accent = "var(--os-accent)";
const line = { stroke: ink, strokeWidth: 1.6, strokeLinejoin: "round", strokeLinecap: "round" } as const;

export function Icon({ name, size = 40 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="os-icon-svg">
      {glyph(name)}
    </svg>
  );
}

function glyph(name: IconName) {
  switch (name) {
    case "hangs": // a calendar page with two people on it
      return (
        <>
          <rect x="6" y="9" width="28" height="25" rx="2" fill={paper} {...line} />
          <path d="M6 16h28" {...line} />
          <path d="M13 6v6M27 6v6" {...line} />
          <circle cx="16" cy="23" r="3" fill={accent} {...line} />
          <circle cx="24" cy="23" r="3" fill={paper} {...line} />
          <path d="M11 31c1-3 3-4 5-4s4 1 5 4M19 31c1-3 3-4 5-4s4 1 5 4" {...line} fill="none" />
        </>
      );
    case "todo": // a notepad with two ticks
      return (
        <>
          <rect x="8" y="6" width="24" height="29" rx="2" fill={paper} {...line} />
          <path d="M12 14l2 2 4-4M12 22l2 2 4-4" {...line} fill="none" />
          <path d="M21 14h7M21 22h7M12 29h16" {...line} />
          <rect x="8" y="6" width="24" height="3" fill={accent} {...line} />
        </>
      );
    case "dropin": // a map pin over a street corner
      return (
        <>
          <path d="M4 33l10-5 12 5 10-5" {...line} fill="none" />
          <path d="M20 29s-9-8-9-15a9 9 0 0118 0c0 7-9 15-9 15z" fill={accent} {...line} />
          <circle cx="20" cy="14" r="3.5" fill={paper} {...line} />
        </>
      );
    case "readme": // a page with a folded corner
      return (
        <>
          <path d="M10 5h14l7 7v23H10z" fill={paper} {...line} />
          <path d="M24 5v7h7" fill="none" {...line} />
          <path d="M14 18h13M14 23h13M14 28h8" {...line} />
        </>
      );
    case "settings": // three sliders
      return (
        <>
          <rect x="5" y="7" width="30" height="27" rx="3" fill={paper} {...line} />
          <path d="M11 14h18M11 21h18M11 28h18" {...line} />
          <circle cx="23" cy="14" r="2.6" fill={accent} {...line} />
          <circle cx="15" cy="21" r="2.6" fill={paper} {...line} />
          <circle cx="26" cy="28" r="2.6" fill={paper} {...line} />
        </>
      );
    case "ideas": // a folder with nothing in it yet
      return (
        <>
          <path d="M4 11h12l3 3h17v19H4z" fill={paper} {...line} />
          <path d="M4 17h32" {...line} />
          <path d="M20 22v6M17 25h6" {...line} stroke={accent} />
        </>
      );
    case "trash":
    case "trash-empty":
      return (
        <>
          {name === "trash" && (
            <>
              <path d="M13 11c0-3 3-4 4-2 1-3 5-3 6 0 2-2 5 0 4 2" fill={paper} {...line} />
              <path d="M18 9l2 2" {...line} />
            </>
          )}
          <path d="M9 12h22" {...line} />
          <path d="M11 12l2 22h14l2-22" fill={paper} {...line} />
          <path d="M17 17v13M23 17v13" {...line} />
        </>
      );
  }
}
