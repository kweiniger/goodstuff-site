import { useEffect } from "react";
import { directions } from "./shared.ts";
import "./lab-nav.css";

/** Small switcher pinned to the corner of every prototype. [ and ] also flip between them. */
export function LabNav({ current }: { current: string }) {
  const i = directions.findIndex((d) => d.slug === current);
  const prev = directions[(i - 1 + directions.length) % directions.length];
  const next = directions[(i + 1) % directions.length];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest("input, textarea, [contenteditable]")) return;
      if (e.key === "[") window.location.href = `/lab/${prev.slug}`;
      if (e.key === "]") window.location.href = `/lab/${next.slug}`;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev.slug, next.slug]);

  return (
    <nav className="labnav" aria-label="design experiments">
      <a href="/lab">lab</a>
      <a href={`/lab/${prev.slug}`} aria-label={`previous: ${prev.name}`} title="previous ( [ )">←</a>
      <span aria-current="page">
        {i + 1}/{directions.length} · {directions[i].name}
      </span>
      <a href={`/lab/${next.slug}`} aria-label={`next: ${next.name}`} title="next ( ] )">→</a>
    </nav>
  );
}
