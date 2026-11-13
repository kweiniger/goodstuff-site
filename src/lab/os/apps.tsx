import { useEffect, useState, type FormEvent } from "react";
import { labProjects } from "../shared.ts";

const real = Object.fromEntries(labProjects.map((p) => [p.name, p]));

/** Footer under each toy app pointing at the real thing. */
function RealThing({ name }: { name: "hangs" | "todo" | "dropin" }) {
  const p = real[name];
  return (
    <p className="os-real">
      a toy version. the real {p.name}: {p.more}, {p.less}.{" "}
      <a href={p.url}>open {p.host} ↗</a>
    </p>
  );
}

/* ---------------- readme.txt ---------------- */

export function Readme({ open }: { open: (id: string) => void }) {
  return (
    <div className="os-doc">
      <p className="os-doc-title">welcome to goodstuff os.</p>
      <p>
        goodstuff is a small studio making useful things for everyday life. the idea is simple: the internet should
        make real life better, not compete with it.
      </p>
      <p>
        everything on this desktop works. try{" "}
        <button type="button" className="os-inline" onClick={() => open("todo")}>todo</button>,{" "}
        <button type="button" className="os-inline" onClick={() => open("hangs")}>hangs</button> or{" "}
        <button type="button" className="os-inline" onClick={() => open("dropin")}>dropin</button>, then have a look in
        the trash.
      </p>
      <p className="os-soft">made by kacey. more soon, probably.</p>
    </div>
  );
}

/* ---------------- todo ---------------- */

type Todo = { id: number; text: string; done: boolean };
const START: Todo[] = [
  { id: 1, text: "buy oat milk", done: false },
  { id: 2, text: "call grandma back", done: false },
  { id: 3, text: "return the library book", done: true },
];

export function TodoApp() {
  const [items, setItems] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem("gs-os-todo");
      if (saved) return JSON.parse(saved) as Todo[];
    } catch {
      /* private mode etc. */
    }
    return START;
  });
  const [draft, setDraft] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("gs-os-todo", JSON.stringify(items));
    } catch {
      /* fine without it */
    }
  }, [items]);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setItems((xs) => [...xs, { id: Date.now(), text, done: false }]);
    setDraft("");
  };
  const left = items.filter((i) => !i.done).length;

  return (
    <div className="os-todo">
      <ul>
        {items.map((it) => (
          <li key={it.id} className={it.done ? "is-done" : ""}>
            <label>
              <input
                type="checkbox"
                checked={it.done}
                onChange={() => setItems((xs) => xs.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)))}
              />
              <span>{it.text}</span>
            </label>
            <button
              type="button"
              className="os-x"
              aria-label={`remove ${it.text}`}
              onClick={() => setItems((xs) => xs.filter((x) => x.id !== it.id))}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="os-todo-add">
        <label className="os-sr" htmlFor="os-todo-input">add a thing</label>
        <input id="os-todo-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="add a thing…" autoComplete="off" />
        <button type="submit" className="os-btn">add</button>
      </form>
      <p className="os-status" aria-live="polite">
        {items.length === 0 ? "empty list. suspiciously calm." : left === 0 ? "nothing left. go outside." : `${left} left`}
      </p>
      <RealThing name="todo" />
    </div>
  );
}

/* ---------------- hangs ---------------- */

const FRIENDS = ["you", "mo", "priya", "jun"];
const SLOTS = ["thu eve", "fri eve", "sat day", "sat eve", "sun day"];
// who is free in each slot (index into FRIENDS)
const FREE: Record<string, number[]> = {
  "thu eve": [0, 1, 3],
  "fri eve": [0, 2],
  "sat day": [0, 1, 2, 3],
  "sat eve": [1, 2, 3],
  "sun day": [0, 3],
};

export function HangsApp() {
  const [pick, setPick] = useState<string | null>(null);
  const everyone = pick ? FREE[pick].length === FRIENDS.length : false;
  const missing = pick ? FRIENDS.filter((_, i) => !FREE[pick].includes(i)) : [];

  return (
    <div className="os-hangs">
      <p className="os-soft">picnic in the park, sometime this week? tap a slot.</p>
      <div className="os-grid" role="group" aria-label="pick a time">
        <span />
        {FRIENDS.map((f) => (
          <span key={f} className="os-grid-head">{f}</span>
        ))}
        {SLOTS.map((s) => (
          <button
            key={s}
            type="button"
            className="os-slot"
            aria-pressed={pick === s}
            onClick={() => setPick(s)}
          >
            <span className="os-slot-name">{s}</span>
            {FRIENDS.map((f, i) => (
              <span key={f} className={FREE[s].includes(i) ? "os-free" : "os-busy"}>
                <span className="os-sr">{`, ${f} ${FREE[s].includes(i) ? "free" : "busy"}`}</span>
              </span>
            ))}
          </button>
        ))}
      </div>
      <p className="os-status" aria-live="polite">
        {!pick
          ? "four people, zero group chat."
          : everyone
            ? `${pick} works for everyone. sorted in one tap.`
            : `${missing.join(" and ")} can't make ${pick}. try another.`}
      </p>
      <RealThing name="hangs" />
    </div>
  );
}

/* ---------------- dropin ---------------- */

const CLASSES = [
  { name: "lunchtime yoga", walk: 4, inMin: 20 },
  { name: "pottery wheel basics", walk: 9, inMin: 35 },
  { name: "climbing taster", walk: 12, inMin: 50 },
  { name: "life drawing", walk: 6, inMin: 85 },
];

const clock = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export function DropinApp() {
  const [booked, setBooked] = useState<string | null>(null);
  const base = new Date();
  base.setMinutes(Math.ceil(base.getMinutes() / 5) * 5, 0, 0);
  const at = (m: number) => clock(new Date(base.getTime() + m * 60_000));
  const cls = CLASSES.find((c) => c.name === booked);

  if (cls)
    return (
      <div className="os-dropin">
        <div className="os-ticket" role="status">
          <span className="os-ticket-top">admit one</span>
          <strong>{cls.name}</strong>
          <span>today at {at(cls.inMin)} · {cls.walk} min walk</span>
          <span className="os-soft">you're in. bring water.</span>
        </div>
        <button type="button" className="os-btn" onClick={() => setBooked(null)}>back to the list</button>
        <RealThing name="dropin" />
      </div>
    );

  return (
    <div className="os-dropin">
      <p className="os-soft">happening near you, soon. (made-up classes, real clock.)</p>
      <ul>
        {CLASSES.map((c) => (
          <li key={c.name}>
            <span>
              <strong>{c.name}</strong>
              <span className="os-soft">{at(c.inMin)} · {c.walk} min walk</span>
            </span>
            <button type="button" className="os-btn" onClick={() => setBooked(c.name)}>drop in</button>
          </li>
        ))}
      </ul>
      <RealThing name="dropin" />
    </div>
  );
}

/* ---------------- preferences ---------------- */

const PREFS = [
  { id: "real", label: "support real life" },
  { id: "small", label: "keep things small" },
  { id: "friction", label: "remove little bits of friction" },
  { id: "soft", label: "a softer kind of technology" },
  { id: "joy", label: "make things because they should exist" },
];
const NOPE = ["infinite scroll", "streaks and badges", "notifications you didn't ask for", "engagement metrics"];

export function SettingsApp() {
  const [nudge, setNudge] = useState<string | null>(null);
  return (
    <div className="os-prefs">
      <fieldset>
        <legend>on</legend>
        {PREFS.map((p) => (
          <label key={p.id}>
            <input
              type="checkbox"
              checked
              onChange={() => {
                // they never stay off
                setNudge(p.id);
                window.setTimeout(() => setNudge(null), 1600);
              }}
            />
            <span>{p.label}</span>
            {nudge === p.id && <em className="os-nudge">nice try.</em>}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>not available on goodstuff</legend>
        {NOPE.map((n) => (
          <label key={n} className="is-disabled">
            <input type="checkbox" disabled />
            <span>{n}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

/* ---------------- trash ---------------- */

export const TRASH = ["infinite-scroll.app", "dark-patterns/", "engagement-metrics.xls", "red-notification-dots/", "growth-hacks.txt"];

export function TrashApp({ items, empty }: { items: string[]; empty: () => void }) {
  return (
    <div className="os-trash">
      {items.length ? (
        <>
          <ul>
            {items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <button type="button" className="os-btn" onClick={empty}>empty trash</button>
        </>
      ) : (
        <p className="os-status" role="status">trash is empty. feels good.</p>
      )}
    </div>
  );
}

/* ---------------- ideas ---------------- */

export function IdeasApp() {
  return (
    <div className="os-doc">
      <p className="os-doc-title">this folder is empty.</p>
      <p className="os-soft">for now. making things, seeing what sticks.</p>
    </div>
  );
}
