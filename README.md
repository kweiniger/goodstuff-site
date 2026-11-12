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
