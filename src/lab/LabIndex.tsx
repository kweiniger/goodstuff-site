import { directions, useLabPage } from "./shared.ts";

export default function LabIndex() {
  useLabPage("index", "goodstuff lab");
  return (
    <div className="mx-auto grid min-h-svh max-w-5xl content-start gap-14 px-[clamp(1.25rem,6vw,5rem)] py-[clamp(1.75rem,6vw,4.5rem)]">
      <header className="flex justify-between text-[17px]">
        <a href="/" className="font-medium">goodstuff</a>
        <span className="text-ink-faint">lab</span>
      </header>
      <div className="grid gap-4">
        <h1 className="text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05] font-[350] tracking-[-0.02em]">
          four directions, <em>to try on.</em>
        </h1>
        <p className="max-w-[44ch] text-lg text-ink-soft">
          working prototypes for the next goodstuff site. the homepage stays as it is. use [ and ] to flip between them.
        </p>
      </div>
      <ol className="border-t border-rule">
        {directions.map((d, i) => (
          <li key={d.slug}>
            <a
              href={`/lab/${d.slug}`}
              className="group grid grid-cols-[2rem_1fr] items-baseline gap-x-4 border-b border-rule py-4 text-[clamp(1.125rem,2.2vw,1.375rem)] sm:grid-cols-[2rem_minmax(8rem,12rem)_1fr]"
            >
              <span className="text-ink-faint tabular-nums">{i + 1}</span>
              <span className="font-medium group-hover:text-pen">{d.name}</span>
              <span className="col-start-2 text-ink-soft sm:col-start-auto">{d.line}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
