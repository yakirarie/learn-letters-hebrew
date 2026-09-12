// Generates the PWA raster icons from public/icon.svg.
//
// Two deliberate behaviours:
//
//  1. It SKIPS when the PNGs already exist, unless --force is passed. Rendering
//     <text> goes through libvips -> fontconfig, so the output depends on which
//     fonts the host has. A CI runner without a Hebrew font would produce tofu
//     boxes, and a build step that silently regenerates broken icons is worse
//     than one that leaves known-good committed ones alone. Icons are therefore
//     committed; `npm run icons -- --force` regenerates them on purpose.
//
//  2. `sharp(svg, { density: 384 })` - the default 72dpi rasterises the 512px
//     viewBox at roughly its natural size and then upscales, which looks soft.
//     Rendering at 384dpi and downscaling keeps the edges crisp.
//
// Run with --preview to print the result as ASCII art, which is how you check
// the glyph actually rendered instead of a tofu box.
import { access, mkdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(root, 'public/icon.svg')
const OUT_DIR = resolve(root, 'public/icons')
const DENSITY = 384

const TARGETS = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
]

const force = process.argv.includes('--force')
const wantPreview = process.argv.includes('--preview')

const exists = async (path) => {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

const svg = await readFile(SOURCE)

async function render(size) {
  return sharp(svg, { density: DENSITY })
    .resize(size, size, { fit: 'contain', background: '#FF9800' })
    .png({ compressionLevel: 9 })
}

await mkdir(OUT_DIR, { recursive: true })

const present = await Promise.all(
  TARGETS.map((t) => exists(resolve(OUT_DIR, t.name))),
)
const allPresent = present.every(Boolean)

if (allPresent && !force) {
  console.log(
    `icons: all ${TARGETS.length} present, skipping render (use --force to regenerate)`,
  )
} else {
  for (const target of TARGETS) {
    const buffer = await render(target.size)
    await buffer.toFile(resolve(OUT_DIR, target.name))
    console.log(`icons: wrote ${target.name} (${target.size}x${target.size})`)
  }
}

if (wantPreview) {
  // Down-sample to terminal cells. Terminal glyphs are roughly twice as tall as
  // wide, so the sample is 2:1 to keep the letter's proportions readable.
  const W = 44
  const H = 22
  const { data } = await sharp(svg, { density: DENSITY })
    .resize(W, H, { fit: 'fill' })
    .greyscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const ramp = ' .:-=+*#%@'
  console.log('\nicon.svg rendered (ASCII preview):')
  for (let y = 0; y < H; y++) {
    let row = ''
    for (let x = 0; x < W; x++) {
      const v = data[y * W + x]
      row += ramp[Math.min(ramp.length - 1, Math.floor((v / 255) * ramp.length))]
    }
    console.log('  ' + row)
  }
  console.log()
}
