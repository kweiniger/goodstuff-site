import { useState } from "react";
import "@fontsource/vt323/400.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/archivo/wdth.css";
import { LabNav } from "../LabNav.tsx";
import { labProjects, useLabPage } from "../shared.ts";
import { Pager } from "./Pager.tsx";
import { Printer } from "./Printer.tsx";
import { Radio } from "./Radio.tsx";
import "./devices.css";

const TAGLINES = ["good things for real life.", "small things for a better internet.", "making things, seeing what sticks.", "one job each."];
const real = Object.fromEntries(labProjects.map((p) => [p.name, p]));

const GADGETS = [
  { id: "hangs", what: "a pager", how: "one page out, three yeses back.", el: <Pager /> },
  { id: "todo", what: "a receipt printer", how: "type a thing, it prints. tear it off when it's done.", el: <Printer /> },
  { id: "dropin", what: "a pocket radio", how: "tune in to what's on nearby.", el: <Radio /> },
] as const;

export default function Devices() {
  useLabPage("devices", "goodstuff · one thing each");
  const [tag, setTag] = useState(0);

  return (
    <div className="dv">
      <header className="dv-head">
        <p className="dv-tape dv-tape-mark">goodstuff</p>
        <button
          type="button"
          className="dv-tape dv-tape-line"
          key={tag}
          onClick={() => setTag((t) => (t + 1) % TAGLINES.length)}
          aria-label={`${TAGLINES[tag]} print another label`}
          title="print another label"
        >
          {TAGLINES[tag]}
        </button>
        <p className="dv-intro">three small tools, each doing one job. so each one gets its own little gadget. go on, press the buttons.</p>
      </header>

      <main className="dv-desk">
        {GADGETS.map((g) => {
          const p = real[g.id];
          return (
            <figure key={g.id} className={`dv-item dv-item-${g.id}`}>
              <div className="dv-gadget">{g.el}</div>
              <figcaption>
                <span className="dv-cap-name">{p.name}</span>, as {g.what}. {g.how}
                <span className="dv-cap-line">
                  {p.more}, {p.less}. <a href={p.url}>open the real {p.name} ↗</a>
                </span>
              </figcaption>
            </figure>
          );
        })}
      </main>

      <footer className="dv-foot">
        <span>more soon, probably.</span>
        <span>by kacey</span>
      </footer>
      <LabNav current="devices" />
    </div>
  );
}
