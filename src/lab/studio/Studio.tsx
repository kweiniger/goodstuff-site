import { useEffect, useRef } from "react";
import "@fontsource-variable/archivo/wdth.css";
import { LabNav } from "../LabNav.tsx";
import { labProjects, prefersReducedMotion, principles, useLabPage } from "../shared.ts";
import "./studio.css";

const WORD = "goodstuff";
const BASE = 100; // resting width, in % of the font's normal width
const MIN = 70;
const MAX = 125;

/** Letters near the pointer get wider, the rest get narrower: more here, less there. */
function useStretchyWord() {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(hover: hover)").matches) return;
    const letters = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-l]"));
    let frame = 0;
    let x = 0;

    const apply = () => {
      frame = 0;
      for (const l of letters) {
        const r = l.getBoundingClientRect();
        const d = Math.abs(x - (r.left + r.width / 2)) / el.clientWidth; // 0..1
        const pull = Math.max(0, 1 - d * 3.2); // only nearby letters react
        l.style.fontStretch = `${MIN + (MAX - MIN) * pull ** 1.5}%`;
      }
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      el.classList.add("is-live");
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      el.classList.remove("is-live");
      for (const l of letters) l.style.fontStretch = `${BASE}%`;
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}

export default function Studio() {
  useLabPage("studio", "goodstuff · studio");
  const word = useStretchyWord();

  return (
    <div className="s">
      <header className="s-top">
        <a href="/lab/studio" className="s-top-mark">goodstuff</a>
        <span>an independent studio for everyday things</span>
        <nav aria-label="sections">
          <a href="#work">work</a>
          <a href="#practice">practice</a>
          <a href="#hello">hello</a>
        </nav>
        <span className="s-top-by">by kacey</span>
      </header>

      <section className="s-hero" aria-labelledby="s-title">
        <h1 id="s-title" ref={word} className="s-word" aria-label={WORD}>
          {WORD.split("").map((c, i) => (
            <span key={i} data-l aria-hidden="true" style={{ animationDelay: `${i * 55}ms` }}>
              {c}
            </span>
          ))}
        </h1>
        <p className="s-lede">
          small, useful things <em>for real life.</em>
          <br />
          made carefully, released when they're ready.
        </p>
      </section>

      <section id="work" className="s-work" aria-labelledby="s-work-h">
        <h2 id="s-work-h" className="s-label">work, in order of making</h2>
        <ol className="s-rows">
          {labProjects.map((p, i) => (
            <li key={p.name}>
              <a href={p.url} className="s-row">
                <span className="s-no">gs/{String(i + 1).padStart(2, "0")}</span>
                <span className="s-name">{p.name}</span>
                <span className="s-desc">
                  <span className="s-more">{p.more}</span>
                  <span className="s-less">{p.less}</span>
                </span>
                <span className="s-go" aria-hidden="true">{p.host} ↗</span>
              </a>
            </li>
          ))}
          <li className="s-row s-row-next" aria-label="next project, in progress">
            <span className="s-no">gs/04</span>
            <span className="s-name">tbd</span>
            <span className="s-desc"><span className="s-less">in the works. more soon, probably.</span></span>
          </li>
        </ol>
      </section>

      <section id="practice" className="s-practice" aria-labelledby="s-practice-h">
        <h2 id="s-practice-h" className="s-label">practice</h2>
        <div className="s-practice-body">
          <p className="s-statement">
            goodstuff is a one-person studio that makes its own small products, and now and then helps others make
            theirs. the common thread is taking out the little bits of friction that get between people and the things
            they actually want to do.
          </p>
          <ul className="s-principles">
            {principles.map((pr) => (
              <li key={pr.title}>
                <h3>{pr.title}</h3>
                <p>{pr.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer id="hello" className="s-foot">
        <p className="s-hello" aria-hidden="true">hello</p>
        <div className="s-foot-row">
          <p>an inbox is coming. for now, more soon, probably.</p>
          <p>goodstuff, by kacey</p>
        </div>
      </footer>

      <LabNav current="studio" />
    </div>
  );
}
