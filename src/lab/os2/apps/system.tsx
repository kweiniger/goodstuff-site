import { useState } from "react";
import { principles } from "../../shared.ts";
import { useOs } from "../context.ts";
import { Icon } from "../icons.tsx";
import { WALLPAPERS } from "../wallpapers.ts";

/* ---------------- readme.txt ---------------- */

export function About() {
  const os = useOs();
  return (
    <div className="o2-stack o2-doc">
      <p className="o2-doc-title">welcome to goodstuff os 2.</p>
      <p>
        goodstuff is a small studio making useful things for everyday life. the idea is simple: the internet should make
        real life better, not compete with it.
      </p>
      <p>
        everything here works. drag things around. open{" "}
        <button type="button" className="o2-link" onClick={() => os.open("hangs")}>hangs</button>,{" "}
        <button type="button" className="o2-link" onClick={() => os.open("todo")}>todo</button> or{" "}
        <button type="button" className="o2-link" onClick={() => os.open("dropin")}>dropin</button>. plant something in the{" "}
        <button type="button" className="o2-link" onClick={() => os.open("garden")}>garden</button> and come back later.
      </p>
      <p className="o2-soft">there are a few secrets on this computer. no hints. (ok, one: try typing.)</p>
      <p className="o2-soft">made by kacey. more soon, probably.</p>
    </div>
  );
}

/* ---------------- about this goodstuff (the secret one) ---------------- */

const SPEC: [string, string][] = [
  ["processor", "one curious human"],
  ["memory", "enough"],
  ["storage", "3 small apps, room for more"],
  ["graphics", "drawn by hand"],
  ["attention required", "very little"],
  ["serial number", "GOODSTUFF-0001"],
];

export function Spec() {
  const os = useOs();
  return (
    <div className="o2-spec">
      <Icon name="spec" size={64} />
      <p className="o2-spec-name">goodstuff os 2</p>
      <p className="o2-soft">version 2.0 · build {__BUILD_DATE__.replaceAll("-", ".")}</p>
      <dl>
        {SPEC.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="o2-btn" onClick={() => os.toast("that's all the info there is. go outside.")}>
        more info…
      </button>
    </div>
  );
}

/* ---------------- preferences ---------------- */

const NOPE = ["infinite scroll", "streaks and badges", "notifications you didn't ask for", "autoplay next"];

export function Prefs() {
  const os = useOs();
  const [nudge, setNudge] = useState<string | null>(null);
  return (
    <div className="o2-stack o2-prefs">
      <fieldset>
        <legend>wallpaper</legend>
        <div className="o2-walls" role="radiogroup" aria-label="wallpaper">
          {WALLPAPERS.map((w) => (
            <button
              key={w.id}
              type="button"
              role="radio"
              aria-checked={os.wallpaper === w.id}
              className="o2-wall"
              onClick={() => os.setWallpaper(w.id)}
            >
              <span className="o2-wall-chip" style={{ background: `${w.pattern}, ${w.bg}` }} />
              <span>{w.name}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>sound</legend>
        <label className="o2-toggle">
          <input type="checkbox" checked={os.sound} onChange={(e) => os.setSound(e.target.checked)} />
          <span>soft clicks and chimes</span>
        </label>
      </fieldset>

      <fieldset>
        <legend>always on</legend>
        {principles.map((p) => (
          <label key={p.title} className="o2-toggle">
            <input
              type="checkbox"
              checked
              onChange={() => {
                os.play("nope");
                setNudge(p.title);
                window.setTimeout(() => setNudge((n) => (n === p.title ? null : n)), 1600);
              }}
            />
            <span>{p.title}</span>
            {nudge === p.title && <em className="o2-nudge">nice try.</em>}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>not available on goodstuff</legend>
        {NOPE.map((n) => (
          <label key={n} className="o2-toggle is-off">
            <input type="checkbox" disabled />
            <span>{n}</span>
          </label>
        ))}
      </fieldset>

      <button type="button" className="o2-btn" onClick={os.resetDesktop}>tidy up desktop</button>
    </div>
  );
}

/* ---------------- trash ---------------- */

export function Trash() {
  const os = useOs();
  return (
    <div className="o2-stack">
      {os.trash.length ? (
        <>
          <ul className="o2-trash">
            {os.trash.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <button type="button" className="o2-btn o2-btn-main" onClick={os.emptyTrash}>empty trash</button>
        </>
      ) : (
        <p className="o2-note" role="status">trash is empty. feels good.</p>
      )}
    </div>
  );
}

/* ---------------- doomscroll.app (won't open) ---------------- */

export function Doomscroll() {
  const os = useOs();
  return (
    <div className="o2-stack o2-alert">
      <Icon name="doomscroll" size={52} />
      <div className="o2-stack">
        <p className="o2-doc-title">doomscroll.app can't be opened.</p>
        <p className="o2-soft">it was designed to keep you here. this computer is for real life.</p>
        <div className="o2-row">
          <button
            type="button"
            className="o2-btn o2-btn-main"
            onClick={() => {
              os.trashItem("doomscroll.app");
              os.close("doomscroll");
            }}
          >
            move to trash
          </button>
          <button type="button" className="o2-btn" onClick={() => os.close("doomscroll")}>ok</button>
        </div>
      </div>
    </div>
  );
}
