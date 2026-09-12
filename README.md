# לומדים עברית — Learn Hebrew Letters and Numbers

An interactive PWA for young children to learn the Hebrew alphabet, numbers 1–30,
and simple addition and subtraction.

Built with **React + TypeScript + Tailwind CSS**, bundled by Vite, with RTL
right-to-left layout throughout.

## Screens

- **אוֹתִיּוֹת — Letters.** A grid hub of all 22 letters; tapping one opens a
  full-screen practice view with the letter, an example word and picture, and a
  large pronunciation button.
- **מִסְפָּרִים — Numbers.** Numbers 1–30 with the object count drawn out in
  emoji, plus correct Hebrew number/noun agreement.
- **חֶשְׁבּוֹן — Maths.** Fifteen addition and subtraction challenges, animated:
  the `+` collapses and the two groups join, or the subtracted items fade away.
- **חִידּוֹן — Quiz.** 24 mixed questions across letters, counting and arithmetic,
  with a star score and a progress bar.
- **כְּתִיבָה — Tracing.** A drawing canvas with the target letter or number as a
  faint guide, twelve colours, and letters / numbers / pictures modes.
- **זִכָּרוֹן — Memory.** Ten pairs of letters, numbers and pictures.

## Getting started

Requires Node 20 or newer.

```bash
npm install
npm run dev        # dev server with hot reload
npm run build      # typecheck, then build to dist/
npm run preview    # serve the built output
npm run typecheck  # tsc --noEmit only
```

`npm run build` runs `tsc --noEmit` before Vite, so a type error fails the build
rather than shipping.

## Deployment

Deploys to GitHub Pages via `.github/workflows/deploy.yml` on every push to
`main`.

Vite's `base` path is derived from the runner, not hardcoded:

```ts
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_ACTIONS && repo ? `/${repo}/` : '/'
```

So CI builds for `/<repo>/` while local development stays at `/`. Nothing needs
editing if the repository is renamed.

> **One-time setup:** in the repository, set **Settings → Pages → Source** to
> **GitHub Actions**. The previous deployment served the repository root as a
> static site; that and artifact-based deployment are mutually exclusive.

## Icons

Raster icons are generated from `public/icon.svg` by
`scripts/generate-icons.mjs`, which `npm run build` runs automatically.

```bash
npm run icons                    # generate if missing
npm run icons -- --force         # regenerate
node scripts/generate-icons.mjs --preview   # print the result as ASCII art
```

The script **skips** when the PNGs already exist, and the generated files are
committed. This is deliberate: the SVG renders `<text>` through
libvips/fontconfig, so the output depends on which fonts the host has. A CI
runner without a Hebrew-capable font would silently produce tofu boxes instead
of `א`. `--preview` exists so that failure is visible rather than shipped.

The source SVG uses a full-bleed square background with the glyph inside the
maskable safe zone, which is why one file serves both `any` and `maskable`.

## Design system

Tokens live in `src/index.css` under Tailwind v4's `@theme` block — colours,
shadows and animations are all defined there and become utilities
(`--color-bubbly-red-500` → `bg-bubbly-red-500`).

`src/lib/palette.ts` maps 14 colour keys to literal class names. It is data
rather than string interpolation because Tailwind scans source text for class
names, so `` `bg-bubbly-${key}-100` `` would be purged from the production build.

Each hue has three contrast roles:

- **`soft`** (`-100`) — card and panel backgrounds
- **`deep`** (`-700`) — the glyph drawn on a `soft` surface
- **`solid`** (`-500`) — accents, rings and progress fills

Glyphs use `deep` on `soft` rather than the original's vivid hex on cream. The
previous build painted each letter in its brand colour on a near-white
background, which put **shin at 1.56:1** and **dalet at 2.19:1** — far below the
3:1 floor for large text. The current palette's worst case is coral at
**4.05:1**, verified against the rendered pixels rather than by arithmetic
alone. `solid` is never used behind white text, because white-on-`-500` fails
for 8 of the 14 hues.

## Accessibility

- Every interactive element has an accessible name; icon-only buttons carry
  Hebrew `aria-label`s.
- Touch targets are at least 56px, and 64px for grid cards and tab buttons.
- `user-scalable=no` was **removed** — it blocked pinch-zoom (WCAG 1.4.4) and is
  ignored by iOS 16+ anyway. Double-tap zoom is suppressed instead with
  `touch-action: manipulation`, which is what the app actually needs.
- A `prefers-reduced-motion` rule neutralises decorative animations globally,
  rather than relying on each component to opt out.

## Fonts and nikud

The app uses the **system font stack only** (`Segoe UI`, `Arial`, `DejaVu Sans`,
`Noto Sans Hebrew`). This is deliberate: vowel-point (nikud) positioning is
font-dependent, and many Hebrew webfonts place the points poorly. Introducing a
webfont should be a decision made after looking at it on real devices.

## Layout notes

- The shell uses `h-[100dvh]`, not `h-screen`: on mobile browsers `100vh` is the
  URL-bar-hidden height, so `h-screen overflow-hidden` clips the footer whenever
  the address bar is showing.
- Scrollable children carry `min-h-0`, without which a flex child refuses to
  shrink below its content and pushes a scrollbar onto the page.

## Project structure

```
src/
  components/   AppShell, AppHeader, TabBar, LetterCard, LetterGrid,
                NavButton, SpeakerButton, MathExpr, icons
  screens/      one file per screen
  data/         letters, numbers, object names (ported from the pre-Vite app)
  lib/          palette, speech, storage, counting
  state/        AppStateProvider (sound, tab, current letter; localStorage)
scripts/
  generate-icons.mjs
  post-merge.sh
```

## Pronunciation

Speech is the **Web Speech API** (`he-IL`) — there are no audio files. Output
therefore depends on the device having a Hebrew voice installed; without one the
browser silently skips the utterance.

## License

MIT
