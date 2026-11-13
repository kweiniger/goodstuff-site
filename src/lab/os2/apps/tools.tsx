import { useEffect, useState, type FormEvent } from "react";
import { labProjects } from "../../shared.ts";
import { store, useOs } from "../context.ts";

const real = Object.fromEntries(labProjects.map((p) => [p.name, p]));

export function RealThing({ name }: { name: "hangs" | "todo" | "dropin" }) {
  const p = real[name];
  return (
    <p className="o2-real">
      a toy version. the real {p.name}: {p.more}, {p.less}. <a href={p.url}>open {p.host} ↗</a>
    </p>
  );
}

/* ---------------- todo ---------------- */

type Todo = { id: number; text: string; done: boolean };
const START: Todo[] = [
  { id: 1, text: "buy oat milk", done: false },
  { id: 2, text: "call grandma back", done: false },
  { id: 3, text: "return the library book", done: true },
];

export function Todo() {
  const os = useOs();
  const [items, setItems] = useState<Todo[]>(() => store.get("gs-os2-todo", START));
  const [draft, setDraft] = useState("");
  useEffect(() => store.set("gs-os2-todo", items), [items]);

  const left = items.filter((i) => !i.done).length;
  const add = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setItems((xs) => [...xs, { id: Date.now(), text, done: false }]);
    setDraft("");
    os.play("pop");
  };
  const toggle = (id: number) => {
    const next = items.map((x) => (x.id === id ? { ...x, done: !x.done } : x));
    setItems(next);
    os.play("click");
    if (next.length && next.every((x) => x.done)) {
      os.play("chime");
      os.toast("list cleared. go outside.");
    }
  };

  return (
    <div className="o2-stack">
      <ul className="o2-todo">
        {items.map((it) => (
          <li key={it.id} className={it.done ? "is-done" : ""}>
            <label>
              <input type="checkbox" className="o2-check" checked={it.done} onChange={() => toggle(it.id)} />
              <span>{it.text}</span>
            </label>
            <button type="button" className="o2-x" aria-label={`remove ${it.text}`} onClick={() => setItems((xs) => xs.filter((x) => x.id !== it.id))}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="o2-row">
        <label className="o2-sr" htmlFor="o2-todo-input">add a thing</label>
        <input id="o2-todo-input" className="o2-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="add a thing…" autoComplete="off" />
        <button type="submit" className="o2-btn o2-btn-main">add</button>
      </form>
      <p className="o2-note" aria-live="polite">
        {items.length === 0 ? "empty list. suspiciously calm." : left === 0 ? "nothing left. go outside." : `${left} left`}
      </p>
      <RealThing name="todo" />
    </div>
  );
}

/* ---------------- hangs ---------------- */

const FRIENDS = ["you", "mo", "priya", "jun"];
const SLOTS: [string, number[]][] = [
  ["thu eve", [0, 1, 3]],
  ["fri eve", [0, 2]],
  ["sat day", [0, 1, 2, 3]],
  ["sat eve", [1, 2, 3]],
  ["sun day", [0, 3]],
];

export function Hangs() {
  const os = useOs();
  const [pick, setPick] = useState<string | null>(null);
  const free = pick ? SLOTS.find(([s]) => s === pick)![1] : [];
  const everyone = free.length === FRIENDS.length;
  const missing = FRIENDS.filter((_, i) => !free.includes(i));

  return (
    <div className="o2-stack">
      <p className="o2-soft">picnic in the park, sometime this week? tap a slot.</p>
      <div className="o2-hangs" role="group" aria-label="pick a time">
        <span />
        {FRIENDS.map((f) => (
          <span key={f} className="o2-hangs-head">{f}</span>
        ))}
        {SLOTS.map(([s, who]) => (
          <button
            key={s}
            type="button"
            className="o2-slot"
            aria-pressed={pick === s}
            onClick={() => {
              setPick(s);
              const all = who.length === FRIENDS.length;
              os.play(all ? "chime" : "nope");
            }}
          >
            <span className="o2-slot-name">{s}</span>
            {FRIENDS.map((f, i) => (
              <span key={f} className={who.includes(i) ? "o2-dot is-free" : "o2-dot"}>
                <span className="o2-sr">{`, ${f} ${who.includes(i) ? "free" : "busy"}`}</span>
              </span>
            ))}
          </button>
        ))}
      </div>
      <p className="o2-note" aria-live="polite">
        {!pick ? "four people, zero group chat." : everyone ? `${pick} works for everyone. sorted in one tap.` : `${missing.join(" and ")} can't make ${pick}.`}
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
const at = (m: number) => {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5 + m, 0, 0);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export function Dropin() {
  const os = useOs();
  const [booked, setBooked] = useState<string | null>(null);
  const cls = CLASSES.find((c) => c.name === booked);

  if (cls)
    return (
      <div className="o2-stack">
        <div className="o2-ticket" role="status">
          <span className="o2-ticket-top">admit one</span>
          <strong>{cls.name}</strong>
          <span>today at {at(cls.inMin)} · {cls.walk} min walk</span>
          <span className="o2-soft">you're in. bring water.</span>
        </div>
        <button type="button" className="o2-btn" onClick={() => setBooked(null)}>back to the list</button>
        <RealThing name="dropin" />
      </div>
    );

  return (
    <div className="o2-stack">
      <p className="o2-soft">happening near you, soon. (made-up classes, real clock.)</p>
      <ul className="o2-list">
        {CLASSES.map((c) => (
          <li key={c.name}>
            <span>
              <strong>{c.name}</strong>
              <span className="o2-soft">{at(c.inMin)} · {c.walk} min walk</span>
            </span>
            <button
              type="button"
              className="o2-btn o2-btn-main"
              onClick={() => {
                setBooked(c.name);
                os.play("chime");
              }}
            >
              drop in
            </button>
          </li>
        ))}
      </ul>
      <RealThing name="dropin" />
    </div>
  );
}
