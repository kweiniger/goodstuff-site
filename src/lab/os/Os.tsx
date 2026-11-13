import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource-variable/instrument-sans";
import { LabNav } from "../LabNav.tsx";
import { prefersReducedMotion, useLabPage } from "../shared.ts";
import { DropinApp, HangsApp, IdeasApp, Readme, SettingsApp, TRASH, TodoApp, TrashApp } from "./apps.tsx";
import { Icon, type IconName } from "./icons.tsx";
import "./os.css";

type AppId = "readme" | "hangs" | "todo" | "dropin" | "settings" | "ideas" | "trash";
type Win = { open: boolean; x: number; y: number; z: number };

const APPS: Record<AppId, { title: string; label: string; icon: IconName; w: number }> = {
  hangs: { title: "hangs", label: "hangs", icon: "hangs", w: 380 },
  todo: { title: "todo", label: "todo", icon: "todo", w: 340 },
  dropin: { title: "dropin", label: "dropin", icon: "dropin", w: 360 },
  readme: { title: "readme.txt", label: "readme.txt", icon: "readme", w: 400 },
  settings: { title: "preferences", label: "preferences", icon: "settings", w: 360 },
  ideas: { title: "ideas", label: "ideas", icon: "ideas", w: 300 },
  trash: { title: "trash", label: "trash", icon: "trash", w: 320 },
};
const DESK: AppId[] = ["hangs", "todo", "dropin", "readme", "settings", "ideas"];
const IDLE_MS = 60_000;

const time = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

function initialWindows(): Record<AppId, Win> {
  const vw = window.innerWidth;
  const ids = Object.keys(APPS) as AppId[];
  return Object.fromEntries(
    ids.map((id, i) => [
      id,
      {
        open: id === "readme",
        x: id === "readme" ? Math.max(140, Math.round((vw - APPS.readme.w) / 2)) : 150 + i * 34,
        y: id === "readme" ? 84 : 64 + i * 30,
        z: id === "readme" ? 2 : 1,
      },
    ]),
  ) as Record<AppId, Win>;
}

export default function Os() {
  useLabPage("os", "goodstuff os");
  const [wins, setWins] = useState(initialWindows);
  const [selected, setSelected] = useState<AppId | null>(null);
  const [trash, setTrash] = useState(TRASH);
  const [menu, setMenu] = useState(false);
  const [power, setPower] = useState<"booting" | "on" | "off">(() => {
    try {
      if (prefersReducedMotion() || sessionStorage.getItem("gs-os-booted")) return "on";
    } catch {
      return "on";
    }
    return "booting";
  });
  const [saver, setSaverState] = useState(false);
  const saverAt = useRef(0);
  const setSaver = useCallback((on: boolean) => {
    if (on) saverAt.current = Date.now();
    // ignore the tiny movements right after it starts
    else if (Date.now() - saverAt.current < 900) return;
    setSaverState(on);
  }, []);
  const [now, setNow] = useState(() => new Date());
  const zTop = useRef(10);

  // menu bar clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  // boot screen, once per session
  useEffect(() => {
    if (power !== "booting") return;
    const done = () => {
      setPower("on");
      try {
        sessionStorage.setItem("gs-os-booted", "1");
      } catch {
        /* ignore */
      }
    };
    const t = setTimeout(done, 2400);
    window.addEventListener("keydown", done, { once: true });
    window.addEventListener("pointerdown", done, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", done);
      window.removeEventListener("pointerdown", done);
    };
  }, [power]);

  // screensaver after a minute of stillness
  useEffect(() => {
    if (power !== "on") return;
    let t = setTimeout(() => setSaver(true), IDLE_MS);
    const wake = () => {
      setSaver(false);
      clearTimeout(t);
      t = setTimeout(() => setSaver(true), IDLE_MS);
    };
    const evs = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    return () => {
      clearTimeout(t);
      evs.forEach((e) => window.removeEventListener(e, wake));
    };
  }, [power, setSaver]);

  const focus = useCallback((id: AppId) => {
    setWins((w) => ({ ...w, [id]: { ...w[id], z: ++zTop.current } }));
  }, []);
  const open = useCallback((id: string) => {
    const app = id as AppId;
    setMenu(false);
    setWins((w) => ({ ...w, [app]: { ...w[app], open: true, z: ++zTop.current } }));
    requestAnimationFrame(() => document.getElementById(`os-win-${app}`)?.focus());
  }, []);
  const close = useCallback((id: AppId) => {
    setWins((w) => ({ ...w, [id]: { ...w[id], open: false } }));
    requestAnimationFrame(() => document.getElementById(`os-icon-${id}`)?.focus());
  }, []);
  const move = useCallback((id: AppId, x: number, y: number) => {
    setWins((w) => ({ ...w, [id]: { ...w[id], x, y } }));
  }, []);

  const openList = (Object.keys(wins) as AppId[]).filter((id) => wins[id].open);
  const active = openList.sort((a, b) => wins[b].z - wins[a].z)[0];

  // escape closes the front window (or the menu)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menu) return setMenu(false);
      if (active) close(active);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, menu, close]);

  if (power === "off")
    return (
      <div className="os-off">
        <p>it's now safe to go outside.</p>
        <button type="button" onClick={() => setPower("on")}>turn back on</button>
        <LabNav current="os" />
      </div>
    );

  return (
    <div className="os" onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}>
      {power === "booting" && <Boot />}

      <header className="os-bar">
        <div className="os-menu">
          <button type="button" className="os-menu-btn" aria-expanded={menu} aria-controls="os-menu-list" onClick={() => setMenu((m) => !m)}>
            goodstuff
          </button>
          {menu && (
            <ul id="os-menu-list" className="os-menu-list">
              <li><button type="button" onClick={() => open("readme")}>about goodstuff</button></li>
              <li><button type="button" onClick={() => open("settings")}>preferences…</button></li>
              <li><button type="button" onClick={() => { setMenu(false); setSaver(true); }}>start screensaver</button></li>
              <li className="os-menu-sep" role="separator" />
              <li><a href="/lab">back to the lab</a></li>
              <li><button type="button" onClick={() => { setMenu(false); setPower("off"); }}>shut down…</button></li>
            </ul>
          )}
        </div>
        <span className="os-bar-mid">{openList.length ? `${openList.length} open` : "nothing open. lovely."}</span>
        <time className="os-clock">{time(now)}</time>
      </header>

      <nav className="os-desk" aria-label="desktop">
        {DESK.map((id) => (
          <DeskIcon key={id} id={id} selected={selected === id} onSelect={setSelected} onOpen={open} />
        ))}
      </nav>
      <div className="os-trash-spot">
        <DeskIcon id="trash" selected={selected === "trash"} onSelect={setSelected} onOpen={open} empty={!trash.length} />
      </div>

      <p className="os-plate" aria-hidden="true">goodstuff os · v1 · made by kacey</p>

      {(Object.keys(wins) as AppId[])
        .filter((id) => wins[id].open)
        .map((id) => (
          <Window key={id} id={id} win={wins[id]} active={id === active} onFocus={focus} onClose={close} onMove={move}>
            {id === "readme" && <Readme open={open} />}
            {id === "todo" && <TodoApp />}
            {id === "hangs" && <HangsApp />}
            {id === "dropin" && <DropinApp />}
            {id === "settings" && <SettingsApp />}
            {id === "ideas" && <IdeasApp />}
            {id === "trash" && <TrashApp items={trash} empty={() => setTrash([])} />}
          </Window>
        ))}

      {saver && <Screensaver onWake={() => setSaver(false)} />}
      <LabNav current="os" />
    </div>
  );
}

function DeskIcon({
  id, selected, onSelect, onOpen, empty,
}: { id: AppId; selected: boolean; onSelect: (id: AppId) => void; onOpen: (id: string) => void; empty?: boolean }) {
  const pointer = useRef("mouse");
  return (
    <button
      id={`os-icon-${id}`}
      type="button"
      className="os-icon"
      aria-pressed={selected}
      aria-label={`open ${APPS[id].label}`}
      onPointerDown={(e) => (pointer.current = e.pointerType)}
      onClick={(e) => {
        // keyboard (detail 0) and touch open straight away; a mouse selects, double-click opens
        if (e.detail === 0 || pointer.current !== "mouse") onOpen(id);
        else onSelect(id);
      }}
      onDoubleClick={() => onOpen(id)}
    >
      <Icon name={empty ? "trash-empty" : APPS[id].icon} />
      <span className="os-icon-label">{APPS[id].label}</span>
    </button>
  );
}

function Window({
  id, win, active, onFocus, onClose, onMove, children,
}: {
  id: AppId; win: Win; active: boolean; children: ReactNode;
  onFocus: (id: AppId) => void; onClose: (id: AppId) => void; onMove: (id: AppId, x: number, y: number) => void;
}) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button") || window.innerWidth < 700) return;
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveTo = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const w = APPS[id].w;
    const x = Math.min(Math.max(e.clientX - drag.current.dx, -w + 80), window.innerWidth - 80);
    const y = Math.min(Math.max(e.clientY - drag.current.dy, 34), window.innerHeight - 40);
    onMove(id, x, y);
  };

  return (
    <section
      id={`os-win-${id}`}
      className={`os-win${active ? " is-active" : ""}`}
      style={{ left: win.x, top: win.y, zIndex: win.z, width: APPS[id].w }}
      aria-labelledby={`os-win-${id}-title`}
      tabIndex={-1}
      onPointerDown={() => onFocus(id)}
      onFocus={() => !active && onFocus(id)}
    >
      <div className="os-title" onPointerDown={down} onPointerMove={moveTo} onPointerUp={() => (drag.current = null)}>
        <button type="button" className="os-close" aria-label={`close ${APPS[id].title}`} onClick={() => onClose(id)} />
        <h2 id={`os-win-${id}-title`}>{APPS[id].title}</h2>
      </div>
      <div className="os-body">{children}</div>
    </section>
  );
}

function Boot() {
  const lines = ["loading good stuff…", "skipping the bad stuff…", "ready."];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, lines.length - 1)), 800);
    return () => clearInterval(t);
  }, [lines.length]);
  return (
    <div className="os-boot" role="status">
      <p className="os-boot-mark">goodstuff</p>
      <div className="os-boot-bar"><span style={{ width: `${((i + 1) / lines.length) * 100}%` }} /></div>
      <p className="os-boot-line">{lines[i]}</p>
      <p className="os-boot-skip">press any key or tap to skip</p>
    </div>
  );
}

/** A minute of stillness gets a gentle suggestion that drifts around the screen. */
function Screensaver({ onWake }: { onWake: () => void }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let x = window.innerWidth * 0.2;
    let y = window.innerHeight * 0.3;
    let vx = 1.1;
    let vy = 0.8;
    let raf = 0;
    const step = () => {
      const r = el.getBoundingClientRect();
      x += vx;
      y += vy;
      if (x <= 0 || x + r.width >= window.innerWidth) vx *= -1;
      if (y <= 0 || y + r.height >= window.innerHeight) vy *= -1;
      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="os-saver" onPointerDown={onWake} role="dialog" aria-label="screensaver">
      <p ref={ref}>you've been still for a while.<br /><em>go outside?</em></p>
    </div>
  );
}
