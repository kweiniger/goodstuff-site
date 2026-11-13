import { useState, type FormEvent } from "react";

type Line = { id: number; text: string; done: boolean };
const FIRST: Line[] = [
  { id: 1, text: "buy oat milk", done: false },
  { id: 2, text: "call grandma back", done: false },
  { id: 3, text: "return library book", done: true },
];

const stamp = () =>
  new Date()
    .toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    .replace(",", "")
    .toLowerCase();

/** todo, as a receipt printer: type a thing, it prints. tap a line to cross it off. tear off when you're done. */
export function Printer() {
  const [lines, setLines] = useState(FIRST);
  const [draft, setDraft] = useState("");
  const [tearing, setTearing] = useState(false);
  const [printed] = useState(stamp);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim().slice(0, 28);
    if (!text) return;
    setLines((ls) => [...ls, { id: Date.now(), text, done: false }]);
    setDraft("");
  };
  const tear = () => {
    setTearing(true);
    window.setTimeout(() => {
      setLines([]);
      setTearing(false);
    }, 650);
  };
  const left = lines.filter((l) => !l.done).length;

  return (
    <div className="pr">
      <div className={`pr-paper${tearing ? " is-tearing" : ""}`}>
        <div className="pr-receipt">
          <p className="pr-head">
            todo
            <br />
            <span>{printed}</span>
          </p>
          <p className="pr-rule" aria-hidden="true">--------------------------</p>
          {lines.length === 0 ? (
            <p className="pr-empty">nothing on the list.</p>
          ) : (
            <ul aria-label="the list">
              {lines.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    aria-pressed={l.done}
                    onClick={() => setLines((ls) => ls.map((x) => (x.id === l.id ? { ...x, done: !x.done } : x)))}
                  >
                    <span aria-hidden="true">{l.done ? "[x]" : "[ ]"}</span> {l.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="pr-rule" aria-hidden="true">--------------------------</p>
          <p className="pr-total" aria-live="polite">
            <span>items {lines.length}</span>
            <span>to do {left}</span>
          </p>
          <p className="pr-thanks">{left === 0 && lines.length ? "all done. go outside." : "thank you for doing."}</p>
        </div>
      </div>

      <div className="pr-body">
        <span className="pr-slot" aria-hidden="true" />
        <form className="pr-form" onSubmit={add}>
          <label htmlFor="pr-input" className="dv-sr">add a thing to print</label>
          <input id="pr-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="type a thing…" maxLength={28} autoComplete="off" />
          <button type="submit" className="pr-btn">print</button>
        </form>
        <div className="pr-row">
          <button type="button" className="pr-btn pr-btn-quiet" onClick={tear} disabled={!lines.length || tearing}>
            tear off
          </button>
          <span className="pr-brand" aria-hidden="true">goodstuff · todo</span>
        </div>
      </div>
    </div>
  );
}
