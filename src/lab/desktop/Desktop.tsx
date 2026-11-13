import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/400-italic.css";
import { LabNav } from "../LabNav.tsx";
import { labProjects, principles, useLabPage } from "../shared.ts";
import "./desktop.css";

type Item = {
  id: string;
  kind: "up" | "dir" | "app" | "txt";
  label: string;
  desc: string;
  text?: string;
  url?: string;
  host?: string;
  more?: string;
  less?: string;
  friction?: string;
  instead?: string;
};

const readme = `goodstuff
=========

a small studio making useful things
for everyday life.

the idea is simple: the internet should
make real life better, not compete with
it. so the things in here are small, do
one job, and get out of the way.

made by kacey.
more soon, probably.
`;

const principlesTxt = principles
  .map((p, i) => `${i + 1}. ${p.title}\n   ${p.body.replace(/(.{1,36})(\s|$)/g, "$1\n   ").trimEnd()}`)
  .join("\n\n") + "\n";

const bytes = (s: string) => new TextEncoder().encode(s).length;

function Icon({ kind }: { kind: Item["kind"] }) {
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", "aria-hidden": true, className: "d-ico" } as const;
  if (kind === "up")
    return (
      <svg {...common}><path d="M8 13V4M4 8l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
    );
  if (kind === "txt")
    return (
      <svg {...common}>
        <path d="M3.5 1.5h6l3 3v10h-9z M9.5 1.5v3h3" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <path d="M5.5 8h5M5.5 10h5M5.5 12h3" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M1.5 3.5h5l1.5 1.5h6.5v8.5h-13z" fill={kind === "app" ? "currentColor" : "none"} fillOpacity={kind === "app" ? 0.16 : 0} stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export default function Desktop() {
  useLabPage("desktop", "index of /goodstuff/");

  const items = useMemo<Item[]>(() => {
    const apps: Item[] = labProjects.map((p) => ({
      id: p.name, kind: "app", label: `${p.name}/`, desc: `${p.more}, ${p.less}.`,
      url: p.url, host: p.host, more: p.more, less: p.less, friction: p.friction, instead: p.instead,
    }));
    return [
      { id: "up", kind: "up", label: "../", desc: "parent directory" },
      ...apps.sort((a, b) => a.label.localeCompare(b.label)),
      { id: "ideas", kind: "dir", label: "ideas/", desc: "making things, seeing what sticks." },
      { id: "principles", kind: "txt", label: "principles.txt", desc: "five things we try to stick to.", text: principlesTxt },
      { id: "readme", kind: "txt", label: "readme.txt", desc: "start here.", text: readme },
    ];
  }, []);

  const [sel, setSel] = useState("readme");
  const rows = useRef<Record<string, HTMLButtonElement | null>>({});
  const selected = items.find((i) => i.id === sel)!;

  const select = (id: string, focus = true) => {
    setSel(id);
    if (focus) rows.current[id]?.focus();
  };
  const open = (it: Item) => {
    if (it.url) window.location.href = it.url;
  };

  const onKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const i = items.findIndex((it) => it.id === sel);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      select(items[n].id);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      select(items[e.key === "Home" ? 0 : items.length - 1].id);
    } else if (e.key === "Enter" && selected.url) {
      e.preventDefault();
      open(selected);
    } else if (/^[a-z]$/i.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      // type-to-select, like a file manager
      const after = [...items.slice(i + 1), ...items.slice(0, i + 1)];
      const hit = after.find((it) => it.label.startsWith(e.key.toLowerCase()));
      if (hit) select(hit.id);
    }
  };

  // keep the selected row in view when using the keyboard on small screens
  useEffect(() => {
    rows.current[sel]?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  return (
    <div className="d">
      <header className="d-head">
        <h1>
          index of /goodstuff/<span className="d-caret" aria-hidden="true" />
        </h1>
        <p className="d-sub">a small studio making useful things for everyday life.</p>
      </header>

      <div className="d-split">
        <section className="d-list" aria-label="files">
          <div className="d-cols" aria-hidden="true">
            <span>name</span>
            <span>size</span>
            <span className="d-col-desc">description</span>
          </div>
          <ul onKeyDown={onKey}>
            {items.map((it) => {
              const size = it.text ? `${bytes(it.text)} B` : it.kind === "app" ? "small" : "-";
              return (
                <li key={it.id}>
                  <button
                    ref={(el) => { rows.current[it.id] = el; }}
                    type="button"
                    className="d-row"
                    aria-current={sel === it.id ? "true" : undefined}
                    tabIndex={sel === it.id ? 0 : -1}
                    onClick={() => select(it.id)}
                    onDoubleClick={() => open(it)}
                  >
                    <span className="d-name"><Icon kind={it.kind} />{it.label}</span>
                    <span className="d-size">{size}</span>
                    <span className="d-desc">{it.desc}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="d-status" aria-hidden="true">
            {items.length} items · {selected.label} selected
            <span className="d-hint"> · ↑↓ to browse{selected.url ? ", enter to open" : ""}</span>
          </p>
        </section>

        <section className="d-preview" aria-label={`preview of ${selected.label}`} aria-live="polite">
          <div className="d-bar">
            <span>{selected.label}</span>
            <span>{selected.text ? `${bytes(selected.text)} bytes` : selected.kind === "app" ? "app" : "folder"}</span>
          </div>
          <div className="d-body">
            {selected.text && <pre>{selected.text}</pre>}

            {selected.kind === "app" && (
              <div className="d-app">
                <p className="d-app-name">{selected.id}</p>
                <p>
                  <span className="d-strike">{selected.friction}.</span> {selected.instead}.
                </p>
                <p className="d-soft">{selected.more}, {selected.less}.</p>
                <a className="d-open" href={selected.url}>
                  open {selected.host} ↗
                </a>
              </div>
            )}

            {selected.id === "ideas" && (
              <p className="d-empty">
                this folder is empty.
                <br />
                for now.
              </p>
            )}

            {selected.id === "up" && (
              <p className="d-empty">
                you're at the top.
                <br />
                the parent directory is real life. go outside sometimes.
              </p>
            )}
          </div>
        </section>
      </div>

      <address className="d-addr">goodstuff/1.0 (real life) server at goodstuffstudio.xyz port 443 · by kacey</address>

      <LabNav current="desktop" />
    </div>
  );
}
