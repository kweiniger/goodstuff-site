import { useEffect, useState } from "react";
import "@fontsource-variable/eb-garamond";
import "@fontsource-variable/eb-garamond/wght-italic.css";
import { LabNav } from "../LabNav.tsx";
import { labProjects, useLabPage } from "../shared.ts";
import "./quiet.css";

function partOfDay(h: number) {
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Counts visits in this browser only. Nothing leaves the page. */
function useVisitCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    try {
      const n = Number(localStorage.getItem("gs-visits") || 0) + 1;
      localStorage.setItem("gs-visits", String(n));
      setCount(n);
    } catch {
      setCount(null);
    }
  }, []);
  return count;
}

const built = new Date(__BUILD_DATE__ + "T12:00:00")
  .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  .toLowerCase();

export default function Quiet() {
  useLabPage("quiet", "goodstuff · quiet internet");
  const [daypart] = useState(() => partOfDay(new Date().getHours()));
  const [note, setNote] = useState(false);
  const visits = useVisitCount();

  return (
    <div className="q">
      <header className="q-head">
        <a href="/lab/quiet" className="q-mark" aria-label="goodstuff">
          <span>good</span>
          <span className="q-mark-swap" aria-hidden="true">
            <span className="q-mark-a">stuff</span>
            <span className="q-mark-b"> {daypart}.</span>
          </span>
        </a>
      </header>

      <main className="q-main">
        <h1>
          goodstuff is a small studio making useful things for everyday life<button
            type="button"
            className="q-fn"
            aria-expanded={note}
            aria-controls="q-note"
            onClick={() => setNote((v) => !v)}
          >
            <span aria-hidden="true">*</span>
            <span className="q-sr">footnote</span>
          </button>.
        </h1>
        <p id="q-note" className="q-note" hidden={!note}>
          * the one with weather, friends, errands, and the occasional nap in it.
        </p>
        <p>
          the internet should make real life better, not compete with it. these are a few small attempts.
        </p>

        <ul className="q-list">
          {labProjects.map((p) => (
            <li key={p.name}>
              <a href={p.url}>{p.name}</a>{" "}
              <span className="q-desc">
                <span className="q-more">{p.more},</span> <span className="q-less">{p.less}.</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="q-soon">more soon, probably.</p>
      </main>

      <footer className="q-foot">
        <p>
          by kacey
          {visits !== null && (
            <>
              {" · "}
              {visits === 1 ? "first time here. hello." : `this is your ${ordinal(visits)} visit. nice to see you again.`}
            </>
          )}
        </p>
        <p>last updated {built}. links you've visited turn purple, like they used to.</p>
      </footer>

      <LabNav current="quiet" />
    </div>
  );
}
