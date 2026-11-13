import {
  useCallback, useEffect, useMemo, useRef, useState,
  type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode,
} from "react";
import "@fontsource-variable/instrument-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import { LabNav } from "../LabNav.tsx";
import { prefersReducedMotion, useLabPage } from "../shared.ts";
import { OsContext, store, type OsApi } from "./context.ts";
import { Icon } from "./icons.tsx";
import { APPS, DESK_ITEMS, STARTING_TRASH, appById, type AppDef, type DeskItem } from "./registry.tsx";
import { play as playSound, setSoundEnabled, type SoundKind } from "./sound.ts";
import { WALLPAPERS } from "./wallpapers.ts";
import "./os2.css";

type Win = { x: number; y: number; w: number; h: number; z: number; min: boolean; max: boolean; prev?: { x: number; y: number; w: number; h: number }; tx?: number; ty?: number };
type Pos = { x: number; y: number };
type Sticky = { id: number; x: number; y: number; text: string; color: number };
type Toast = { id: number; msg: string };

const MENU_H = 30;
const DOCK_SPACE = 104;
const IDLE_MS = 60_000;
const ICON_W = 96;
const ICON_H = 92;
const STICKY_COLORS = ["#ffe680", "#ffc8d6", "#c8f0d8"];

function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return size;
}

function defaultIcons(vw: number, vh: number): Record<string, Pos> {
  const perCol = Math.max(1, Math.floor((vh - 44 - DOCK_SPACE) / ICON_H));
  const out: Record<string, Pos> = {};
  DESK_ITEMS.filter((d) => !d.junk).forEach((d, i) => {
    const col = Math.floor(i / perCol);
    out[d.id] = { x: vw - 112 - col * 104, y: 44 + (i % perCol) * ICON_H };
  });
  out.doomscroll = { x: Math.round(vw * 0.44), y: Math.round(vh * 0.52) };
  return out;
}
const defaultStickies = (vw: number, vh: number): Sticky[] => [
  { id: 1, x: Math.round(vw * 0.44) - 190, y: Math.round(vh * 0.52) - 40, text: "psst.\ndrag doomscroll.app\ninto the trash →", color: 0 },
];

const clock = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export default function Os2() {
  useLabPage("os2", "goodstuff os 2");
  const { w: vw, h: vh } = useViewport();
  const mobile = vw < 700;
  const reduced = useMemo(prefersReducedMotion, []);

  /* ---------- system state ---------- */
  const [power, setPower] = useState<"booting" | "on" | "off">(() => {
    try {
      if (reduced || sessionStorage.getItem("gs-os2-booted")) return "on";
    } catch {
      return "on";
    }
    return "booting";
  });
  const [wallpaper, setWallpaperState] = useState<string>(() => store.get("gs-os2-wall", "meadow"));
  const [sketchWall, setSketchWall] = useState<string | null>(() => store.get<string | null>("gs-os2-sketchwall", null));
  const [sound, setSoundState] = useState<boolean>(() => store.get("gs-os2-sound", false));
  const [wins, setWins] = useState<Record<string, Win>>({});
  const [icons, setIcons] = useState<Record<string, Pos>>(() => ({ ...defaultIcons(vw, vh), ...store.get("gs-os2-icons", {}) }));
  const [gone, setGone] = useState<string[]>(() => store.get("gs-os2-gone", []));
  const [trash, setTrash] = useState<string[]>(() => store.get("gs-os2-trash", STARTING_TRASH));
  const [stickies, setStickies] = useState<Sticky[]>(() => store.get("gs-os2-stickies", defaultStickies(vw, vh)));
  const [selected, setSelected] = useState<string[]>([]);
  const [overTrash, setOverTrash] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [menu, setMenu] = useState<string | null>(null);
  const [ctxMenu, setCtxMenu] = useState<Pos | null>(null);
  const [band, setBand] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [grass, setGrass] = useState(false);
  const [saver, setSaverState] = useState(false);
  const [bouncing, setBouncing] = useState<string | null>(null);
  const [battery, setBattery] = useState(82);
  const [now, setNow] = useState(() => new Date());
  const zTop = useRef(10);
  const saverAt = useRef(0);

  useEffect(() => store.set("gs-os2-wall", wallpaper), [wallpaper]);
  useEffect(() => store.set("gs-os2-icons", icons), [icons]);
  useEffect(() => store.set("gs-os2-gone", gone), [gone]);
  useEffect(() => store.set("gs-os2-trash", trash), [trash]);
  useEffect(() => store.set("gs-os2-stickies", stickies), [stickies]);
  useEffect(() => {
    store.set("gs-os2-sound", sound);
    setSoundEnabled(sound);
  }, [sound]);

  const play = useCallback((k: SoundKind) => playSound(k), []);
  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, msg }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const setSaver = useCallback((on: boolean) => {
    if (on) saverAt.current = Date.now();
    else if (Date.now() - saverAt.current < 900) return;
    setSaverState(on);
  }, []);

  /* ---------- windows ---------- */
  const focusWin = (id: string) => requestAnimationFrame(() => document.getElementById(`o2-win-${id}`)?.focus());

  const open = useCallback((id: string) => {
    const app = appById[id];
    if (!app) return;
    setMenu(null);
    setCtxMenu(null);
    setWins((ws) => {
      const cur = ws[id];
      if (cur) return { ...ws, [id]: { ...cur, min: false, z: ++zTop.current } };
      const n = Object.keys(ws).length;
      const w = Math.min(app.w, window.innerWidth - 24);
      const h = Math.min(app.h, window.innerHeight - MENU_H - DOCK_SPACE - 10);
      const x = Math.max(12, Math.min(Math.round((window.innerWidth - w) / 2) - 140 + n * 34, window.innerWidth - w - 12));
      const y = Math.max(MENU_H + 10, Math.min(48 + n * 30, window.innerHeight - h - DOCK_SPACE));
      return { ...ws, [id]: { x, y, w, h, z: ++zTop.current, min: false, max: false } };
    });
    if (app.dock && !reduced) {
      setBouncing(id);
      window.setTimeout(() => setBouncing((b) => (b === id ? null : b)), 700);
    }
    play("open");
    focusWin(id);
  }, [play, reduced]);

  const close = useCallback((id: string) => {
    setWins((ws) => {
      const { [id]: _gone, ...rest } = ws;
      return rest;
    });
    play("close");
  }, [play]);

  const patch = useCallback((id: string, p: Partial<Win>) => setWins((ws) => (ws[id] ? { ...ws, [id]: { ...ws[id], ...p } } : ws)), []);
  const raise = useCallback((id: string) => setWins((ws) => (ws[id] && ws[id].z !== zTop.current ? { ...ws, [id]: { ...ws[id], z: ++zTop.current } } : ws)), []);

  const minimize = (id: string) => {
    const win = wins[id];
    const target = (document.getElementById(`o2-dock-${id}`) ?? document.getElementById("o2-dock"))?.getBoundingClientRect();
    if (!win || !target) return;
    patch(id, { min: true, tx: target.left + target.width / 2 - (win.x + win.w / 2), ty: target.top + target.height / 2 - (win.y + win.h / 2) });
    play("pop");
  };
  const zoom = (id: string) => {
    const win = wins[id];
    if (!win) return;
    if (win.max && win.prev) patch(id, { ...win.prev, max: false });
    else patch(id, { prev: { x: win.x, y: win.y, w: win.w, h: win.h }, x: 10, y: MENU_H + 10, w: vw - 20, h: vh - MENU_H - DOCK_SPACE - 10, max: true });
  };

  const openIds = Object.keys(wins);
  const active = openIds.filter((id) => !wins[id].min).sort((a, b) => wins[b].z - wins[a].z)[0];

  /* ---------- trash ---------- */
  const trashItem = useCallback((label: string) => {
    const item = DESK_ITEMS.find((d) => d.label === label);
    if (item) setGone((g) => (g.includes(item.id) ? g : [...g, item.id]));
    setTrash((t) => (t.includes(label) ? t : [...t, label]));
    play("trash");
    toast(label === "doomscroll.app" ? "doomscroll.app moved to trash. you just got an hour back." : `${label} moved to trash.`);
  }, [play, toast]);
  const emptyTrash = useCallback(() => {
    setTrash([]);
    play("trash");
    toast("trash emptied. feels good.");
  }, [play, toast]);

  const resetDesktop = useCallback(() => {
    setIcons(defaultIcons(window.innerWidth, window.innerHeight));
    setGone([]);
    setTrash(STARTING_TRASH);
    setStickies(defaultStickies(window.innerWidth, window.innerHeight));
    toast("desktop tidied. everything's back where it started.");
    play("pop");
  }, [play, toast]);

  const wallList = WALLPAPERS.map((w) => w.id as string).concat(sketchWall ? ["sketch"] : []);
  const setWallpaper = useCallback((id: string) => {
    setWallpaperState(id);
    play("click");
  }, [play]);
  const setSketchWallpaper = useCallback((url: string) => {
    setSketchWall(url);
    store.set("gs-os2-sketchwall", url);
    setWallpaperState("sketch");
    play("chime");
  }, [play]);

  const api: OsApi = {
    open, close, toast, play, wallpaper, setWallpaper, setSketchWallpaper,
    sound, setSound: setSoundState, trash, trashItem, emptyTrash, resetDesktop,
  };

  /* ---------- timers: boot, clock, battery, the one notification, screensaver ---------- */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    const bat = setInterval(() => setBattery((b) => Math.max(12, b - 1)), 45_000);
    return () => {
      clearInterval(id);
      clearInterval(bat);
    };
  }, []);

  useEffect(() => {
    if (power !== "booting") return;
    const done = () => {
      setPower("on");
      try {
        sessionStorage.setItem("gs-os2-booted", "1");
      } catch {
        /* ignore */
      }
    };
    const t = setTimeout(done, 2200);
    window.addEventListener("keydown", done, { once: true });
    window.addEventListener("pointerdown", done, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", done);
      window.removeEventListener("pointerdown", done);
    };
  }, [power]);

  useEffect(() => {
    if (power !== "on") return;
    try {
      if (sessionStorage.getItem("gs-os2-notified")) return;
    } catch {
      return;
    }
    const t = setTimeout(() => {
      toast("this is the only notification you'll get today.");
      play("pop");
      try {
        sessionStorage.setItem("gs-os2-notified", "1");
      } catch {
        /* ignore */
      }
    }, 30_000);
    return () => clearTimeout(t);
  }, [power, toast, play]);

  useEffect(() => {
    if (power !== "on") return;
    let t = setTimeout(() => setSaver(true), IDLE_MS);
    const wake = () => {
      setSaver(false);
      clearTimeout(t);
      t = setTimeout(() => setSaver(true), IDLE_MS);
    };
    const evs = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    return () => {
      clearTimeout(t);
      evs.forEach((e) => window.removeEventListener(e, wake));
    };
  }, [power, setSaver]);

  /* ---------- keyboard: escape, and words typed into thin air ---------- */
  const typed = useRef("");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (ctxMenu || menu) {
          setCtxMenu(null);
          setMenu(null);
        } else if (active) close(active);
        return;
      }
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest("input, textarea, [contenteditable]")) return;
      if (!/^[a-z ]$/i.test(e.key)) return;
      typed.current = (typed.current + e.key.toLowerCase()).slice(-24);
      const flat = typed.current.replace(/ /g, "");
      if (flat.endsWith("touchgrass")) {
        typed.current = "";
        setGrass(true);
        play("chime");
        toast("ahh. better.");
      } else if (flat.endsWith("hello")) {
        typed.current = "";
        toast("hello to you too.");
        play("pop");
      } else if (flat.endsWith("doomscroll")) {
        typed.current = "";
        toast("nope.");
        play("nope");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close, ctxMenu, menu, play, toast]);

  /* ---------- the g menu, and what happens if you keep clicking it ---------- */
  const gClicks = useRef<number[]>([]);
  const onLogo = () => {
    const t = Date.now();
    gClicks.current = [...gClicks.current.filter((c) => t - c < 1800), t];
    if (gClicks.current.length >= 5) {
      gClicks.current = [];
      setMenu(null);
      open("spec");
      return;
    }
    setMenu((m) => (m === "g" ? null : "g"));
    play("click");
  };

  /* ---------- desktop icons ---------- */
  const deskItems = DESK_ITEMS.filter((d) => !gone.includes(d.id));
  const clampPos = (p: Pos): Pos => ({
    x: Math.max(4, Math.min(p.x, vw - ICON_W - 4)),
    y: Math.max(MENU_H + 6, Math.min(p.y, vh - DOCK_SPACE - ICON_H)),
  });
  const trashRect = () => document.getElementById("o2-dock-trash")?.getBoundingClientRect();
  const isOverTrash = (cx: number, cy: number) => {
    const r = trashRect();
    return !!r && cx > r.left - 24 && cx < r.right + 24 && cy > r.top - 30 && cy < r.bottom + 20;
  };
  const dragIcon = (id: string, p: Pos, cx: number, cy: number) => {
    setIcons((ic) => ({ ...ic, [id]: p }));
    setOverTrash(isOverTrash(cx, cy));
  };
  const dropIcon = (item: DeskItem, start: Pos, cx: number, cy: number) => {
    setOverTrash(false);
    if (isOverTrash(cx, cy)) {
      if (item.junk) {
        trashItem(item.label);
        return;
      }
      setIcons((ic) => ({ ...ic, [item.id]: start }));
      play("nope");
      toast(`${item.label} is staying. it's one of the good ones.`);
      return;
    }
    setIcons((ic) => ({ ...ic, [item.id]: clampPos({ x: Math.round(ic[item.id].x / 8) * 8, y: Math.round(ic[item.id].y / 8) * 8 }) }));
  };

  /* ---------- rubber-band selection on the desktop ---------- */
  const onDeskDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    setMenu(null);
    setCtxMenu(null);
    setSelected([]);
    if (mobile || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setBand({ x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY });
  };
  const onDeskMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!band) return;
    const next = { ...band, x1: e.clientX, y1: e.clientY };
    setBand(next);
    const [l, r] = [Math.min(next.x0, next.x1), Math.max(next.x0, next.x1)];
    const [t, b] = [Math.min(next.y0, next.y1), Math.max(next.y0, next.y1)];
    setSelected(deskItems.filter((d) => {
      const p = clampPos(icons[d.id]);
      return p.x < r && p.x + ICON_W > l && p.y < b && p.y + ICON_H > t;
    }).map((d) => d.id));
  };

  /* ---------- dock magnification ---------- */
  const dockRef = useRef<HTMLDivElement>(null);
  const onDockMove = (e: RPointerEvent) => {
    if (reduced || mobile || e.pointerType !== "mouse") return;
    dockRef.current?.querySelectorAll<HTMLElement>("[data-dock]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      el.style.setProperty("--s", String(1 + 0.55 * Math.max(0, 1 - d / 150) ** 2));
    });
  };
  const onDockLeave = () => dockRef.current?.querySelectorAll<HTMLElement>("[data-dock]").forEach((el) => el.style.setProperty("--s", "1"));

  const grassBlades = useMemo(() => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: 140 }, (_, i) => ({ left: (i / 140) * 100 + rnd() * 0.6, h: 18 + rnd() * 34, r: -12 + rnd() * 24, d: rnd() * 0.8, hue: rnd() }));
  }, []);

  /* ---------- render ---------- */
  const wp = WALLPAPERS.find((w) => w.id === wallpaper);
  const deskStyle: CSSProperties =
    wallpaper === "sketch" && sketchWall
      ? { background: `#fffdf6 url(${sketchWall}) center / cover no-repeat` }
      : { background: `${(wp ?? WALLPAPERS[0]).pattern}, ${(wp ?? WALLPAPERS[0]).bg}` };
  const darkDesk = !!wp?.dark && wallpaper !== "sketch";

  if (power === "off")
    return (
      <div className="o2-off">
        <p>it's now safe to go outside.</p>
        <button type="button" onClick={() => setPower("booting")}>turn back on</button>
        <LabNav current="os2" />
      </div>
    );

  const menus: Record<string, { label: string; run: () => void; disabled?: boolean; check?: boolean }[]> = {
    g: [
      { label: "about goodstuff os 2", run: () => open("about") },
      { label: "preferences…", run: () => open("prefs") },
      { label: "start screensaver", run: () => { setMenu(null); setSaver(true); } },
      { label: "back to the lab", run: () => (window.location.href = "/lab") },
      { label: "shut down…", run: () => { setMenu(null); play("close"); setPower("off"); } },
    ],
    file: [
      { label: "new sticky note", run: () => newSticky() },
      { label: "open readme.txt", run: () => open("about") },
      { label: "close window", run: () => active && close(active), disabled: !active },
    ],
    view: [
      ...wallList.map((id) => ({ label: `${id === "sketch" ? "your sketch" : WALLPAPERS.find((w) => w.id === id)!.name} wallpaper`, run: () => { setWallpaper(id); setMenu(null); }, check: wallpaper === id })),
      { label: "tidy up desktop", run: () => { resetDesktop(); setMenu(null); } },
    ],
    help: [
      { label: "goodstuff os help", run: () => { setMenu(null); toast("help isn't installed. you're doing great."); } },
      { label: "keyboard shortcuts", run: () => { setMenu(null); toast("esc closes things. [ and ] flip lab pages. typing does… things."); } },
    ],
  };

  function newSticky() {
    setMenu(null);
    setCtxMenu(null);
    const p = ctxMenu ?? { x: vw / 2 - 90, y: vh / 3 };
    setStickies((s) => [...s, { id: Date.now(), x: p.x, y: p.y, text: "", color: s.length % STICKY_COLORS.length }]);
    play("pop");
  }

  return (
    <OsContext.Provider value={api}>
      <div className={`o2${darkDesk ? " is-dark" : ""}${mobile ? " is-mobile" : ""}`} style={deskStyle}>
        {power === "booting" && <Boot />}

        {/* menu bar */}
        <header className="o2-bar">
          <nav className="o2-menus" aria-label="menu bar">
            <div className="o2-menu">
              <button type="button" className="o2-logo" aria-expanded={menu === "g"} aria-label="goodstuff menu" onClick={onLogo}>
                g
              </button>
              {menu === "g" && <MenuList items={menus.g} />}
            </div>
            <span className="o2-app-name">{active ? appById[active].title : "goodstuff"}</span>
            {(["file", "view", "help"] as const).map((m) => (
              <div className="o2-menu o2-menu-text" key={m}>
                <button type="button" aria-expanded={menu === m} onClick={() => setMenu((x) => (x === m ? null : m))} onPointerEnter={() => menu && setMenu(m)}>
                  {m}
                </button>
                {menu === m && <MenuList items={menus[m]} />}
              </div>
            ))}
          </nav>
          <div className="o2-status">
            <button type="button" className="o2-status-btn" aria-pressed={sound} aria-label={sound ? "sound on" : "sound off"} title="sound" onClick={() => { setSoundState((s) => !s); }}>
              <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
                <path d="M1 5h3l4-3v10L4 9H1z" fill="currentColor" />
                {sound ? <path d="M11 4c1.5 1.5 1.5 4.5 0 6M13.5 2c3 3 3 7 0 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /> : <path d="M11 4l5 6M16 4l-5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
              </svg>
            </button>
            <button type="button" className="o2-status-btn o2-battery" title="social battery" aria-label={`social battery ${battery}%`} onClick={() => toast(`social battery ${battery}%. ${battery < 40 ? "a quiet night in might help." : "enough for a hang."}`)}>
              <span className="o2-batt" aria-hidden="true"><span style={{ width: `${battery}%` }} /></span>
            </button>
            <button
              type="button"
              className="o2-status-btn o2-clock"
              onClick={() => toast(`${now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }).toLowerCase()}. nothing urgent.`)}
            >
              {clock(now)}
            </button>
          </div>
        </header>

        {/* desktop surface */}
        <div
          className="o2-desk"
          onPointerDown={onDeskDown}
          onPointerMove={onDeskMove}
          onPointerUp={() => setBand(null)}
          onContextMenu={(e) => {
            if (e.target !== e.currentTarget || mobile) return;
            e.preventDefault();
            setMenu(null);
            setCtxMenu({ x: Math.min(e.clientX, vw - 220), y: Math.min(e.clientY, vh - 220) });
          }}
        >
          {grass && (
            <div className="o2-grass" aria-hidden="true">
              {grassBlades.map((b, i) => (
                <span key={i} style={{ left: `${b.left}%`, height: b.h, rotate: `${b.r}deg`, animationDelay: `${b.d}s`, filter: `hue-rotate(${b.hue * 30 - 15}deg)` }} />
              ))}
            </div>
          )}

          {!mobile && stickies.map((s) => (
            <StickyNote
              key={s.id}
              note={s}
              onChange={(p) => setStickies((all) => all.map((x) => (x.id === s.id ? { ...x, ...p } : x)))}
              onRemove={() => { setStickies((all) => all.filter((x) => x.id !== s.id)); play("trash"); }}
            />
          ))}

          <nav className="o2-icons" aria-label="desktop">
            {deskItems.map((d) => (
              <DeskIcon
                key={d.id}
                item={d}
                pos={clampPos(icons[d.id] ?? { x: 20, y: 60 })}
                mobile={mobile}
                selected={selected.includes(d.id)}
                onSelect={() => { setSelected([d.id]); play("click"); }}
                onOpen={() => open(d.opens)}
                onDrag={(p, cx, cy) => dragIcon(d.id, p, cx, cy)}
                onDrop={(start, cx, cy) => dropIcon(d, start, cx, cy)}
                onDelete={() => (d.junk ? trashItem(d.label) : (play("nope"), toast(`${d.label} is staying.`)))}
              />
            ))}
          </nav>

          {band && (
            <span
              className="o2-band"
              style={{ left: Math.min(band.x0, band.x1), top: Math.min(band.y0, band.y1), width: Math.abs(band.x1 - band.x0), height: Math.abs(band.y1 - band.y0) }}
            />
          )}
        </div>

        {openIds.map((id) => (
          <Window
            key={id}
            app={appById[id]}
            win={wins[id]}
            active={id === active}
            mobile={mobile}
            onPatch={(p) => patch(id, p)}
            onRaise={() => raise(id)}
            onClose={() => close(id)}
            onMin={() => minimize(id)}
            onZoom={() => zoom(id)}
          >
            {appById[id].render()}
          </Window>
        ))}

        {ctxMenu && (
          <div className="o2-ctx" style={{ left: ctxMenu.x, top: ctxMenu.y }}>
            <MenuList
              items={[
                { label: "new sticky note", run: newSticky },
                { label: "change wallpaper", run: () => { setWallpaper(wallList[(wallList.indexOf(wallpaper) + 1) % wallList.length]); setCtxMenu(null); } },
                { label: "tidy up desktop", run: () => { resetDesktop(); setCtxMenu(null); } },
                { label: "go outside", run: () => { setCtxMenu(null); setSaver(true); } },
              ]}
            />
          </div>
        )}

        {/* dock */}
        <div className="o2-dock-wrap">
          <div id="o2-dock" className="o2-dock" ref={dockRef} onPointerMove={onDockMove} onPointerLeave={onDockLeave} role="toolbar" aria-label="dock">
            {APPS.filter((a) => a.dock).map((a) => (
              <button
                key={a.id}
                id={`o2-dock-${a.id}`}
                data-dock
                type="button"
                className={`o2-dock-item${bouncing === a.id ? " is-bouncing" : ""}`}
                aria-label={`${wins[a.id] ? "show" : "open"} ${a.title}`}
                onClick={() => (wins[a.id] && !wins[a.id].min && active === a.id ? minimize(a.id) : open(a.id))}
              >
                <Icon name={a.icon} />
                <span className="o2-dock-tip" aria-hidden="true">{a.title}</span>
                {wins[a.id] && <span className="o2-dock-dot" aria-hidden="true" />}
              </button>
            ))}
            <span className="o2-dock-sep" aria-hidden="true" />
            <button
              id="o2-dock-trash"
              data-dock
              type="button"
              className={`o2-dock-item${overTrash ? " is-target" : ""}`}
              aria-label={`open trash, ${trash.length} items`}
              onClick={() => open("trash")}
            >
              <Icon name={trash.length ? "trash-full" : "trash"} />
              <span className="o2-dock-tip" aria-hidden="true">trash</span>
              {wins.trash && <span className="o2-dock-dot" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="o2-toasts" aria-live="polite">
          {toasts.map((t) => (
            <p key={t.id} className="o2-toast">
              <span className="o2-toast-g" aria-hidden="true">g</span>
              {t.msg}
            </p>
          ))}
        </div>

        {saver && <Screensaver onWake={() => setSaver(false)} />}
        <LabNav current="os2" />
      </div>
    </OsContext.Provider>
  );
}

/* ================= pieces ================= */

function MenuList({ items }: { items: { label: string; run: () => void; disabled?: boolean; check?: boolean }[] }) {
  return (
    <ul className="o2-menu-list" role="menu">
      {items.map((it) => (
        <li key={it.label} role="none">
          <button type="button" role="menuitem" disabled={it.disabled} onClick={it.run}>
            <span className="o2-check-mark" aria-hidden="true">{it.check ? "✓" : ""}</span>
            {it.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

function DeskIcon({
  item, pos, mobile, selected, onSelect, onOpen, onDrag, onDrop, onDelete,
}: {
  item: DeskItem; pos: Pos; mobile: boolean; selected: boolean;
  onSelect: () => void; onOpen: () => void; onDelete: () => void;
  onDrag: (p: Pos, cx: number, cy: number) => void; onDrop: (start: Pos, cx: number, cy: number) => void;
}) {
  const drag = useRef<{ sx: number; sy: number; start: Pos; moved: boolean; type: string } | null>(null);
  return (
    <button
      type="button"
      className={`o2-icon${selected ? " is-selected" : ""}${item.junk ? " is-junk" : ""}`}
      style={mobile ? undefined : { left: pos.x, top: pos.y }}
      aria-label={`${item.label}${item.junk ? ", can be dragged to the trash" : ""}`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        drag.current = { sx: e.clientX, sy: e.clientY, start: pos, moved: false, type: e.pointerType };
        if (!mobile) e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || mobile) return;
        const dx = e.clientX - d.sx;
        const dy = e.clientY - d.sy;
        if (!d.moved && Math.hypot(dx, dy) < 5) return;
        d.moved = true;
        onDrag({ x: d.start.x + dx, y: d.start.y + dy }, e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;
        if (d.moved) onDrop(d.start, e.clientX, e.clientY);
        else if (d.type !== "mouse") onOpen();
        else onSelect();
      }}
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onOpen();
        } else if (e.key === "Delete" || e.key === "Backspace") onDelete();
      }}
      onClick={(e) => e.detail === 0 && onOpen()}
    >
      <Icon name={item.icon} />
      <span className="o2-icon-label">{item.label}</span>
    </button>
  );
}

function Window({
  app, win, active, mobile, children, onPatch, onRaise, onClose, onMin, onZoom,
}: {
  app: AppDef; win: Win; active: boolean; mobile: boolean; children: ReactNode;
  onPatch: (p: Partial<Win>) => void; onRaise: () => void; onClose: () => void; onMin: () => void; onZoom: () => void;
}) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const size = useRef<{ sx: number; sy: number; w: number; h: number } | null>(null);
  const style: CSSProperties = mobile
    ? { zIndex: win.z }
    : ({ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z, "--tx": `${win.tx ?? 0}px`, "--ty": `${win.ty ?? 0}px` } as CSSProperties);

  return (
    <section
      id={`o2-win-${app.id}`}
      className={`o2-win${active ? " is-active" : ""}${win.min ? " is-min" : ""}${win.max ? " is-max" : ""}`}
      style={style}
      aria-labelledby={`o2-win-${app.id}-t`}
      aria-hidden={win.min || undefined}
      tabIndex={-1}
      onPointerDown={onRaise}
    >
      <div
        className="o2-title"
        onDoubleClick={(e) => !(e.target as HTMLElement).closest("button") && !mobile && onZoom()}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button") || mobile || win.max) return;
          drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          onPatch({
            x: Math.min(Math.max(e.clientX - drag.current.dx, -win.w + 90), window.innerWidth - 90),
            y: Math.min(Math.max(e.clientY - drag.current.dy, MENU_H + 2), window.innerHeight - 60),
          });
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <button type="button" className="o2-wbtn o2-wbtn-close" aria-label={`close ${app.title}`} onClick={onClose}>
          <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.5 2.5l5 5M7.5 2.5l-5 5" /></svg>
        </button>
        <h2 id={`o2-win-${app.id}-t`}><span>{app.title}</span></h2>
        {!mobile && (
          <>
            <button type="button" className="o2-wbtn" aria-label={`minimize ${app.title}`} onClick={onMin}>
              <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 5h6" /></svg>
            </button>
            <button type="button" className="o2-wbtn" aria-label={`${win.max ? "restore" : "zoom"} ${app.title}`} onClick={onZoom}>
              <svg viewBox="0 0 10 10" aria-hidden="true"><path d={win.max ? "M3 3h4v4H3z" : "M2 2h6v6H2z"} /></svg>
            </button>
          </>
        )}
      </div>
      <div className="o2-body">{children}</div>
      {!mobile && !win.max && (
        <span
          className="o2-resize"
          aria-hidden="true"
          onPointerDown={(e) => {
            e.stopPropagation();
            onRaise();
            size.current = { sx: e.clientX, sy: e.clientY, w: win.w, h: win.h };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const s = size.current;
            if (!s) return;
            onPatch({ w: Math.max(280, s.w + e.clientX - s.sx), h: Math.max(200, s.h + e.clientY - s.sy) });
          }}
          onPointerUp={() => (size.current = null)}
        />
      )}
    </section>
  );
}

function StickyNote({ note, onChange, onRemove }: { note: Sticky; onChange: (p: Partial<Sticky>) => void; onRemove: () => void }) {
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  return (
    <div className="o2-sticky" style={{ left: note.x, top: note.y, background: STICKY_COLORS[note.color] }}>
      <div
        className="o2-sticky-bar"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          drag.current = { dx: e.clientX - note.x, dy: e.clientY - note.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => drag.current && onChange({ x: Math.max(0, e.clientX - drag.current.dx), y: Math.max(MENU_H, e.clientY - drag.current.dy) })}
        onPointerUp={() => (drag.current = null)}
      >
        <button type="button" aria-label="change colour" className="o2-sticky-btn" onClick={() => onChange({ color: (note.color + 1) % STICKY_COLORS.length })}>●</button>
        <button type="button" aria-label="remove sticky note" className="o2-sticky-btn" onClick={onRemove}>×</button>
      </div>
      <textarea
        aria-label="sticky note"
        value={note.text}
        placeholder="write something…"
        onChange={(e) => onChange({ text: e.target.value })}
        spellCheck={false}
      />
    </div>
  );
}

function Boot() {
  return (
    <div className="o2-boot" role="status">
      <span className="o2-boot-g" aria-hidden="true">g</span>
      <p>goodstuff os 2</p>
      <div className="o2-boot-bar"><span /></div>
      <p className="o2-boot-skip">press any key or tap to skip</p>
    </div>
  );
}

function Screensaver({ onWake }: { onWake: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let x = window.innerWidth * 0.25;
    let y = window.innerHeight * 0.3;
    let vx = 0.9;
    let vy = 0.6;
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
    <div className="o2-saver" role="dialog" aria-label="screensaver" onPointerDown={onWake}>
      <span className="o2-saver-sun" aria-hidden="true" />
      <div ref={ref} className="o2-saver-msg">
        <p>you've been still for a while.</p>
        <p><em>go outside?</em></p>
      </div>
    </div>
  );
}
