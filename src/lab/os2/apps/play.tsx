import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { store, useOs } from "../context.ts";

/* ---------------- garden: a very slow game ---------------- */

type Plot = { plantedAt: number | null; kind: number };
const STAGE_MS = 20_000; // each growth stage, in real time
const FLOWERS = ["#ff8c66", "#ffd23f", "#9fb4ff", "#f28dc0"];
const STAGES = ["a seed. give it time.", "a sprout.", "getting there.", "in bloom. pick it."];
const emptyPlots = (): Plot[] => Array.from({ length: 6 }, (_, i) => ({ plantedAt: null, kind: i % FLOWERS.length }));

export function Garden() {
  const os = useOs();
  const [plots, setPlots] = useState<Plot[]>(() => store.get("gs-os2-garden", emptyPlots()));
  const [picked, setPicked] = useState<number>(() => store.get("gs-os2-picked", 0));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => store.set("gs-os2-garden", plots), [plots]);
  useEffect(() => store.set("gs-os2-picked", picked), [picked]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const stage = (p: Plot) => (p.plantedAt === null ? -1 : Math.min(3, Math.floor((now - p.plantedAt) / STAGE_MS)));

  const act = (i: number) => {
    const p = plots[i];
    const s = stage(p);
    if (s === -1) {
      setPlots((ps) => ps.map((x, j) => (j === i ? { ...x, plantedAt: Date.now() } : x)));
      os.play("pop");
    } else if (s === 3) {
      setPlots((ps) => ps.map((x, j) => (j === i ? { plantedAt: null, kind: (x.kind + 1) % FLOWERS.length } : x)));
      setPicked((n) => n + 1);
      os.play("chime");
      if ((picked + 1) % 5 === 0) os.toast(`${picked + 1} flowers picked. maybe give some to a friend.`);
    } else {
      // watering helps a little
      setPlots((ps) => ps.map((x, j) => (j === i && x.plantedAt ? { ...x, plantedAt: x.plantedAt - 6000 } : x)));
      os.play("click");
    }
  };

  return (
    <div className="o2-stack">
      <p className="o2-soft">a very slow game. plant something, then go and do something else. it grows while you're away.</p>
      <div className="o2-garden">
        {plots.map((p, i) => {
          const s = stage(p);
          const label = s === -1 ? "empty plot. plant a seed" : s === 3 ? "flower in bloom. pick it" : `${STAGES[s]} water it`;
          return (
            <button key={i} type="button" className={`o2-plot is-s${s}`} onClick={() => act(i)} aria-label={label} title={s === -1 ? "plant" : s === 3 ? "pick" : "water"}>
              <Plant stage={s} color={FLOWERS[p.kind]} />
              <span className="o2-plot-hint" aria-hidden="true">{s === -1 ? "plant" : s === 3 ? "pick" : "water"}</span>
            </button>
          );
        })}
      </div>
      <p className="o2-note">flowers picked: {picked}. tap to plant, tap to water, tap to pick.</p>
    </div>
  );
}

function Plant({ stage, color }: { stage: number; color: string }) {
  const ink = "#1c1b19";
  return (
    <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
      <path d="M8 50c8-5 36-5 44 0" fill="#8a6a4a" stroke={ink} strokeWidth="2" />
      {stage >= 0 && <ellipse cx="30" cy="47" rx="3" ry="2" fill="#5b4330" />}
      {stage >= 1 && <path d="M30 47V36" stroke={ink} strokeWidth="2" strokeLinecap="round" />}
      {stage >= 1 && <path d="M30 40c-5 0-7-3-7-6 4 0 7 2 7 6z" fill="#a5d67f" stroke={ink} strokeWidth="1.6" />}
      {stage >= 2 && <path d="M30 36V24M30 33c5 0 7-3 7-6-4 0-7 2-7 6z" fill="#a5d67f" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />}
      {stage >= 3 && (
        <g className="o2-bloom">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="30" cy="16" rx="4.2" ry="7" fill={color} stroke={ink} strokeWidth="1.4" transform={`rotate(${r} 30 22)`} />
          ))}
          <circle cx="30" cy="22" r="3.6" fill="#ffd23f" stroke={ink} strokeWidth="1.4" />
        </g>
      )}
    </svg>
  );
}

/* ---------------- sketch: draw, then make it your wallpaper ---------------- */

const INKS = [
  { name: "ink", c: "#1c1b19" },
  { name: "coral", c: "#ff8c66" },
  { name: "sun", c: "#ffd23f" },
  { name: "mint", c: "#7fcfae" },
  { name: "sky", c: "#9fb4ff" },
];

export function Sketch() {
  const os = useOs();
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(INKS[0].c);
  const [size, setSize] = useState(4);
  const [erase, setErase] = useState(false);

  const fit = useCallback(() => {
    const c = canvas.current;
    const w = wrap.current;
    if (!c || !w) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = w.getBoundingClientRect();
    if (Math.round(width * dpr) === c.width && Math.round(height * dpr) === c.height) return;
    const old = document.createElement("canvas");
    old.width = c.width;
    old.height = c.height;
    old.getContext("2d")?.drawImage(c, 0, 0);
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
    const g = c.getContext("2d")!;
    g.fillStyle = "#fffdf6";
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(old, 0, 0);
  }, []);

  useEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [fit]);

  const point = (e: RPointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
  };
  const stroke = (p: { x: number; y: number }) => {
    if (!last.current) return;
    const g = canvas.current!.getContext("2d")!;
    g.strokeStyle = erase ? "#fffdf6" : color;
    g.lineWidth = (erase ? size * 4 : size) * (window.devicePixelRatio || 1);
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(last.current.x, last.current.y);
    g.lineTo(p.x, p.y);
    g.stroke();
    last.current = p;
  };
  const clear = () => {
    const c = canvas.current!;
    const g = c.getContext("2d")!;
    g.fillStyle = "#fffdf6";
    g.fillRect(0, 0, c.width, c.height);
    os.play("trash");
  };

  return (
    <div className="o2-sketch">
      <div className="o2-sketch-tools" role="toolbar" aria-label="sketch tools">
        {INKS.map((k) => (
          <button
            key={k.name}
            type="button"
            className="o2-swatch"
            style={{ background: k.c }}
            aria-label={k.name}
            aria-pressed={!erase && color === k.c}
            onClick={() => {
              setColor(k.c);
              setErase(false);
            }}
          />
        ))}
        <button type="button" className="o2-btn o2-btn-sm" aria-pressed={erase} onClick={() => setErase((v) => !v)}>
          eraser
        </button>
        <label className="o2-size">
          <span className="o2-sr">brush size</span>
          <input type="range" min={2} max={16} value={size} onChange={(e) => setSize(Number(e.target.value))} />
        </label>
        <span className="o2-grow" />
        <button type="button" className="o2-btn o2-btn-sm" onClick={clear}>clear</button>
        <button
          type="button"
          className="o2-btn o2-btn-sm o2-btn-main"
          onClick={() => {
            os.setSketchWallpaper(canvas.current!.toDataURL("image/png"));
            os.toast("your sketch is now the wallpaper. very gallery.");
          }}
        >
          use as wallpaper
        </button>
      </div>
      <div className="o2-canvas" ref={wrap}>
        <canvas
          ref={canvas}
          aria-label="drawing area"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            const p = point(e);
            last.current = p;
            stroke({ x: p.x + 0.1, y: p.y }); // a tap leaves a dot
          }}
          onPointerMove={(e) => stroke(point(e))}
          onPointerUp={() => (last.current = null)}
          onPointerCancel={() => (last.current = null)}
        />
      </div>
    </div>
  );
}
