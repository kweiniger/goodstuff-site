import { useEffect, useMemo, useState, type CSSProperties } from "react";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/instrument-sans";
import { LabNav } from "../LabNav.tsx";
import { labProjects, useLabPage } from "../shared.ts";
import "./day.css";

/** Solid page colours through the day (minute of day → colour). Blended between stops. */
const SKY: [number, string][] = [
  [0, "#191c2b"],
  [300, "#262842"],
  [400, "#e9cbbb"],
  [540, "#f3ece0"],
  [780, "#f6f4ed"],
  [1020, "#f2e0bb"],
  [1140, "#e8a07c"],
  [1230, "#3b3352"],
  [1440, "#191c2b"],
];

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function skyAt(min: number) {
  const i = SKY.findIndex(([m]) => m > min);
  const [m0, c0] = SKY[i - 1];
  const [m1, c1] = SKY[i];
  const t = (min - m0) / (m1 - m0);
  const [a, b] = [hex(c0), hex(c1)];
  const rgb = a.map((v, k) => Math.round(v + (b[k] - v) * t));
  const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  return { bg: `rgb(${rgb.join(" ")})`, dark: lum < 0.45 };
}

const fmt = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const nowMin = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

type Moment = { at: number; text: string; tool?: (typeof labProjects)[number] };
const byName = Object.fromEntries(labProjects.map((p) => [p.name, p]));
const DAY: Moment[] = [
  { at: 430, text: "wake up. kettle on." },
  { at: 510, text: "everything you need to do, out of your head and onto one list.", tool: byName.todo },
  { at: 735, text: "lunch break. there's a class around the corner at 12:45.", tool: byName.dropin },
  { at: 900, text: "nothing on the calendar. good." },
  { at: 1110, text: "dinner with friends, sorted without forty messages.", tool: byName.hangs },
  { at: 1360, text: "phone down. lights off." },
];

export default function Day() {
  useLabPage("day", "goodstuff · a day");
  const [follow, setFollow] = useState(true);
  const [t, setT] = useState(nowMin);

  useEffect(() => {
    if (!follow) return;
    setT(nowMin());
    const id = setInterval(() => setT(nowMin()), 20_000);
    return () => clearInterval(id);
  }, [follow]);

  const sky = useMemo(() => skyAt(t), [t]);
  useEffect(() => {
    document.documentElement.style.setProperty("--day-bg", sky.bg);
    document.documentElement.dataset.dark = sky.dark ? "1" : "0";
  }, [sky]);

  const current = DAY.reduce((acc, m, i) => (m.at <= t ? i : acc), -1);
  const nowIndex = current + 1; // where the "now" line sits in the list

  return (
    <div className="y" style={{ "--day-bg": sky.bg } as CSSProperties}>
      <header className="y-head">
        <a href="/lab/day" className="y-mark">goodstuff</a>
        <span className="y-clock" aria-hidden="true">{fmt(t)}</span>
      </header>

      <section className="y-hero">
        <h1>
          a good day has <em>very little admin</em> in it.
        </h1>
        <p>goodstuff makes small tools for the in-between bits, so the rest of the day stays yours.</p>
      </section>

      <div className="y-scrub">
        <label htmlFor="y-time">
          {follow ? <>it's {fmt(t)} where you are.</> : <>imagine it's {fmt(t)}.</>}{" "}
          <span className="y-soft">drag to move through the day.</span>
        </label>
        <input
          id="y-time"
          type="range"
          min={0}
          max={1439}
          step={5}
          value={t}
          aria-valuetext={fmt(t)}
          onChange={(e) => {
            setFollow(false);
            setT(Number(e.target.value));
          }}
        />
        <div className="y-ticks" aria-hidden="true">
          <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
        </div>
        {!follow && (
          <button type="button" className="y-back" onClick={() => setFollow(true)}>
            back to now
          </button>
        )}
      </div>

      <ol className="y-day" aria-label="an ordinary day">
        {DAY.map((m, i) => (
          <MomentRow key={m.at} m={m} state={i < current ? "past" : i === current ? "current" : "later"} nowLine={i === nowIndex ? t : null} />
        ))}
        {nowIndex === DAY.length && <NowLine t={t} />}
      </ol>

      <footer className="y-foot">
        <em>more soon, probably.</em>
        <span>by kacey</span>
      </footer>

      <LabNav current="day" />
    </div>
  );
}

function NowLine({ t }: { t: number }) {
  return (
    <li className="y-now" aria-label={`now, ${fmt(t)}`}>
      <span>{fmt(t)}</span>
      <span className="y-now-rule" />
      <span>now</span>
    </li>
  );
}

function MomentRow({ m, state, nowLine }: { m: Moment; state: string; nowLine: number | null }) {
  return (
    <>
      {nowLine !== null && <NowLine t={nowLine} />}
      <li className={`y-m is-${state}${m.tool ? " has-tool" : ""}`}>
        <time className="y-time">{fmt(m.at)}</time>
        <div className="y-what">
          <p>{m.text}</p>
          {m.tool && (
            <a className="y-tool" href={m.tool.url}>
              <span className="y-tool-name">{m.tool.name}</span>
              <span className="y-tool-line">
                {m.tool.more}, {m.tool.less}. <span aria-hidden="true">↗</span>
              </span>
            </a>
          )}
        </div>
      </li>
    </>
  );
}
