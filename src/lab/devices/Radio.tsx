import { useMemo, useState, type CSSProperties } from "react";

const STATIONS = [
  { f: 88.4, name: "lunchtime yoga", walk: 4, inMin: 20 },
  { f: 92.1, name: "pottery wheel", walk: 9, inMin: 35 },
  { f: 97.3, name: "climbing taster", walk: 12, inMin: 50 },
  { f: 101.9, name: "life drawing", walk: 6, inMin: 85 },
  { f: 105.5, name: "swim, lane 3", walk: 7, inMin: 25 },
];
const MIN = 87.5;
const MAX = 108;

const at = (m: number) => {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5 + m, 0, 0);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** dropin, as a pocket radio: tune the dial until a class nearby comes in clearly. */
export function Radio() {
  const [f, setF] = useState(90.0);
  const [booked, setBooked] = useState<string | null>(null);

  const near = useMemo(() => {
    const s = STATIONS.reduce((a, b) => (Math.abs(b.f - f) < Math.abs(a.f - f) ? b : a));
    return { s, d: Math.abs(s.f - f) };
  }, [f]);
  const tuned = near.d <= 0.3 ? near.s : null;
  const noise = Math.min(1, near.d / 1.2); // 0 clear, 1 static
  const ticket = STATIONS.find((s) => s.name === booked);

  const tune = (v: number) => {
    setBooked(null);
    setF(Math.round(Math.min(MAX, Math.max(MIN, v)) * 10) / 10);
  };

  return (
    <div className="rd" style={{ "--noise": noise } as CSSProperties}>
      <div className="rd-body">
        <div className="rd-grille" aria-hidden="true" />
        <div className="rd-window">
          <div className="rd-scale" aria-hidden="true">
            {[88, 92, 96, 100, 104, 108].map((n) => (
              <span key={n} style={{ left: `${((n - MIN) / (MAX - MIN)) * 100}%` }}>{n}</span>
            ))}
            {STATIONS.map((s) => (
              <i key={s.f} style={{ left: `${((s.f - MIN) / (MAX - MIN)) * 100}%` }} />
            ))}
            <b className="rd-needle" style={{ left: `${((f - MIN) / (MAX - MIN)) * 100}%` }} />
          </div>
          <div className="rd-lcd" role="status" aria-live="polite">
            <span className="rd-static" aria-hidden="true" />
            <span>{f.toFixed(1)} fm{tuned ? ` · ${tuned.walk} min walk` : ""}</span>
            <span>
              {ticket
                ? `you're in. ${at(ticket.inMin)}. bring water.`
                : tuned
                  ? `${tuned.name} · ${at(tuned.inMin)}`
                  : "ksshhhh…"}
            </span>
          </div>
        </div>

        <label htmlFor="rd-dial" className="dv-sr">tune the dial</label>
        <input
          id="rd-dial"
          className="rd-dial"
          type="range"
          min={MIN}
          max={MAX}
          step={0.1}
          value={f}
          aria-valuetext={tuned ? `${f.toFixed(1)}, ${tuned.name}` : `${f.toFixed(1)}, static`}
          onChange={(e) => tune(Number(e.target.value))}
        />

        <div className="rd-row">
          <button type="button" className="rd-knob" aria-label="tune down" onClick={() => tune(f - 0.1)}>−</button>
          <button type="button" className="rd-knob" aria-label="tune up" onClick={() => tune(f + 0.1)}>+</button>
          <button type="button" className="rd-go" disabled={!tuned || !!ticket} onClick={() => tuned && setBooked(tuned.name)}>
            drop in
          </button>
        </div>
        <span className="rd-brand" aria-hidden="true">goodstuff · dropin</span>
      </div>
    </div>
  );
}
