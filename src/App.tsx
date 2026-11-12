import { ProjectList } from "./components/ProjectList.tsx";

export default function App() {
  return (
    <div className="mx-auto grid min-h-svh max-w-5xl content-between gap-[clamp(3.5rem,10vw,7rem)] px-[clamp(1.25rem,6vw,5rem)] py-[clamp(1.75rem,6vw,4.5rem)]">
      <header>
        <a href="/" className="text-[17px] font-medium tracking-[-0.01em]">
          goodstuff
        </a>
      </header>

      <main className="grid gap-[clamp(3.5rem,10vw,7rem)]">
        <div className="grid gap-[18px]">
          <h1 className="text-[clamp(2.375rem,5.6vw,3.625rem)] leading-[1.02] font-[350] tracking-[-0.02em] text-balance">
            good things <em className="block">for real life.</em>
          </h1>
          <p className="max-w-[34ch] text-[clamp(1.0625rem,2vw,1.25rem)] leading-snug text-ink-soft">
            tools that support real life instead of competing with it. good stuff.
          </p>
        </div>

        <ProjectList />
      </main>

      <footer className="flex flex-wrap justify-between gap-2 text-[15px] text-ink-faint">
        <em className="text-ink-soft">more soon, probably.</em>
        <span>by kacey</span>
      </footer>
    </div>
  );
}
