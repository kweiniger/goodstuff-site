# goodstuff

the homepage for goodstuff, at [goodstuffstudio.xyz](https://goodstuffstudio.xyz).
good things for real life.

## develop

```bash
npm install
npm run dev
```

`npm run build` type-checks and builds to `dist/`. `npm run preview` serves the build.

## where things live

- `src/projects.ts`: the project list. add an entry and it appears on the page.
- `src/App.tsx`: the page (wordmark, headline, list, footer).
- `src/components/ProjectList.tsx`: the project rows.
- `src/index.css`: colour and font tokens (Tailwind v4 `@theme`).
- `public/`: favicon, apple touch icon and the share image (`og.png`).

## lab (design experiments)

prototype directions live under `/lab`, separate from the homepage:

- `/lab`: index of the experiments
- `/lab/quiet`: quiet internet, hidden delight
- `/lab/studio`: art-directed studio, variable-width type
- `/lab/desktop`: "index of /", a browsable folder
- `/lab/day`: an ordinary day that follows your clock
- `/lab/os`: goodstuff os, a little desktop where every icon opens a working toy app
- `/lab/devices`: one thing each, every app on its own made-up gadget (pager, receipt printer, pocket radio)
- `/lab/os2`: goodstuff os 2, a softer desktop with a dock, draggable icons and windows, mini apps and secrets.
  to add a mini app or game, write a component in `src/lab/os2/apps/` and add one line to `src/lab/os2/registry.tsx`.

each one loads on its own (see `src/main.tsx`), so none of them add weight to the homepage. they're marked
`noindex`. `vercel.json` rewrites `/lab/*` to the app. press `[` and `]` to flip between them.

## regenerating the favicon pngs and share image

`public/favicon.svg` is the source "g" (Newsreader, outlined). After changing it or the headline, run:

```bash
node scripts/generate-assets.mjs
```

This needs Playwright with Chromium installed (`npx playwright install chromium`).

## deploy

it's a static Vite site. On Vercel, import the repo as a new project. The Vite preset
detects everything (build `npm run build`, output `dist`). Then add `goodstuffstudio.xyz`
as the domain.
