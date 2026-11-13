import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "paging" | "replies" | "done";
const FRIENDS = ["mo", "priya", "jun"];

const clock = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** hangs, as a pager: send one page, get three yeses, done. */
export function Pager() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [replies, setReplies] = useState(0);
  const [buzz, setBuzz] = useState(0);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const page = () => {
    clear();
    setReplies(0);
    setPhase("paging");
    const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    FRIENDS.forEach((_, i) =>
      later(1300 + i * 1000, () => {
        setPhase("replies");
        setReplies(i + 1);
        setBuzz((b) => b + 1);
      }),
    );
    later(1300 + FRIENDS.length * 1000 + 200, () => setPhase("done"));
  };
  const reset = () => {
    clear();
    setPhase("idle");
    setReplies(0);
  };

  let top = `HANGS      ${clock()}`;
  let bottom = "NO NEW PAGES";
  if (phase === "paging") {
    top = "PAGING MO,PRIYA,JUN";
    bottom = "PICNIC SAT? ...";
  } else if (phase === "replies") {
    top = `${FRIENDS[replies - 1].toUpperCase()}: SAT OK`;
    bottom = `${replies} OF ${FRIENDS.length} FREE`;
  } else if (phase === "done") {
    top = "ALL FREE SAT DAY";
    bottom = "SORTED. 0 TEXTS.";
  }

  return (
    <div className="pg" data-phase={phase}>
      <div className="pg-body" key={buzz} data-buzz={buzz > 0 ? "1" : "0"}>
        <span className="pg-clip" aria-hidden="true" />
        <span className={`pg-led${phase === "replies" || phase === "done" ? " is-on" : ""}`} aria-hidden="true" />
        <div className="pg-screen" role="status" aria-live="polite">
          <span>{top}</span>
          <span>{bottom}</span>
        </div>
        <div className="pg-keys">
          <button type="button" className="pg-key pg-key-main" onClick={page} disabled={phase === "paging" || phase === "replies"}>
            page
          </button>
          <button type="button" className="pg-key" onClick={reset}>
            clear
          </button>
        </div>
        <span className="pg-brand" aria-hidden="true">goodstuff · hangs</span>
      </div>
    </div>
  );
}
