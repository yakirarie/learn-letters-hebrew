// Data integrity checks for the letter dataset.
//
// These are the invariants the app silently depends on. Run with:
//   npm run check:data
//
// What it checks, and why each matters:
//   1. Every final-form word actually ENDS in its final letter. A word listed
//      under ך that ends in something else would teach the wrong shape.
//   2. The five finals are exactly kaf/mem/nun/pe/tsadi, each inheriting its
//      base letter's palette, and ordered as their base letters appear.
//   3. No example emoji is shared between two letters. The quiz asks "which
//      letter does this word start with?" and shows only the emoji, so a shared
//      emoji would make a question genuinely ambiguous.
//   4. The five finals are NOT in the quiz or memory pool. Every word they
//      carry ends with the letter, so making one an answer to "which letter
//      does this word START with?" would be false.
//   5. Every example word carries at least one vowel point (nikud).
//
// What it deliberately CANNOT check: whether the vowel points are CORRECT.
// That needs a Hebrew speaker.
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/data/letters.ts', import.meta.url), 'utf8')

/** Reads one exported array literal back out of the source. */
function readArray(name) {
  const decl = src.indexOf(`export const ${name}`)
  if (decl === -1) return null
  const eq = src.indexOf('=', decl)
  const from = src.indexOf('[', eq)
  let depth = 0
  for (let i = from; i < src.length; i++) {
    if (src[i] === '[') depth++
    else if (src[i] === ']') {
      depth--
      if (depth === 0) return eval(`(${src.slice(from, i + 1)})`)
    }
  }
  return null
}

const letters = readArray('letters')
const finalLetters = readArray('finalLetters')
const gridLetters = readArray('gridLetters')

const MARKS = /[\u0591-\u05C7]/
const stripMarks = (w) => w.replace(/[\u0591-\u05C7]/g, '')

// base letter -> its final form, in the order the base letters appear
const EXPECTED = new Map([
  ['\u05db', '\u05da'], // kaf   -> final kaf
  ['\u05de', '\u05dd'], // mem   -> final mem
  ['\u05e0', '\u05df'], // nun   -> final nun
  ['\u05e4', '\u05e3'], // pe    -> final pe
  ['\u05e6', '\u05e5'], // tsadi -> final tsadi
])

const failures = []
const check = (ok, message) => {
  if (!ok) failures.push(message)
}

check(letters.length === 22, `expected 22 letters, found ${letters?.length}`)
check(finalLetters?.length === 5, `expected 5 final letters, found ${finalLetters?.length}`)
check(gridLetters?.length === 27, `expected 27 grid letters, found ${gridLetters?.length}`)

for (const letter of letters) {
  check(!('final' in letter), `${letter.l} still carries a 'final' field; it should be its own entry`)
  for (const ex of letter.examples) {
    check(MARKS.test(ex.word), `${letter.l}: example "${ex.word}" has no nikud`)
  }
}

// ---- the five finals -------------------------------------------------------
const expectedForms = [...EXPECTED.values()]
for (let i = 0; i < expectedForms.length; i++) {
  check(
    finalLetters?.[i]?.l === expectedForms[i],
    `final ${i + 1} is "${finalLetters?.[i]?.l}", expected "${expectedForms[i]}"`,
  )
}

// Ordering: finals must follow the order their base letters appear in `letters`.
const baseOrder = letters.map((l) => l.l).filter((l) => EXPECTED.has(l))
const expectedOrder = baseOrder.map((l) => EXPECTED.get(l))
check(
  JSON.stringify(expectedOrder) === JSON.stringify(finalLetters?.map((f) => f.l)),
  `finals are ordered ${finalLetters?.map((f) => f.l).join('')}, expected ${expectedOrder.join('')}`,
)

for (const [base, form] of EXPECTED) {
  const basePalette = letters.find((l) => l.l === base)?.palette
  const finalEntry = finalLetters?.find((f) => f.l === form)
  if (!finalEntry) continue
  check(
    finalEntry.palette === basePalette,
    `${form} uses palette "${finalEntry.palette}" but its base ${base} uses "${basePalette}"`,
  )
  for (const ex of finalEntry.examples) {
    const bare = stripMarks(ex.word)
    const last = bare[bare.length - 1]
    check(
      last === form,
      `${form}: example "${ex.word}" ends in "${last}", expected "${form}"`,
    )
    check(MARKS.test(ex.word), `${form}: example "${ex.word}" has no nikud`)
  }
}

// ---- the finals must stay out of the quiz and memory pool ------------------
for (const entry of finalLetters ?? []) {
  check(
    !letters.some((l) => l.l === entry.l),
    `${entry.l} appears in both ` + '`letters` and `finalLetters`',
  )
}
for (const letter of letters) {
  for (const ex of letter.examples) {
    check(
      !finalLetters?.some((f) => f.l === ex.pic),
      `a final glyph (${ex.pic}) is being used as an example picture`,
    )
  }
}

// ---- emoji uniqueness across the pool the quiz draws from ------------------
const owner = new Map()
for (const letter of letters) {
  for (const ex of letter.examples) {
    const previous = owner.get(ex.pic)
    check(!previous, `emoji ${ex.pic} is used by both "${previous}" and "${letter.l}"`)
    owner.set(ex.pic, letter.l)
  }
}

if (failures.length) {
  console.error(`check:data FAILED with ${failures.length} problem(s):`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(
  `check:data passed — ${letters.length} letters + ${finalLetters.length} finals = ${gridLetters.length} in the grid`,
)
console.log('note: vowel points are present but their correctness is not verified here.')
