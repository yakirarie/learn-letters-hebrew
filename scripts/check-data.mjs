// Data integrity checks for the letter dataset.
//
// These are the invariants the app silently depends on. Run with:
//   npm run check:data
//
// What it checks, and why each matters:
//   1. Every final-form word actually ENDS in its final letter. A word listed
//      under ך that ends in something else would teach the wrong shape.
//   2. Exactly five letters have a final form, and they are kaf/mem/nun/pe/tsadi.
//   3. No example emoji is shared between two letters. The quiz asks "which
//      letter does this word start with?" and shows only the emoji, so a shared
//      emoji would make a question genuinely ambiguous.
//   4. Every example word carries at least one vowel point (nikud).
//
// What it deliberately CANNOT check: whether the vowel points are CORRECT.
// That needs a Hebrew speaker.
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/data/letters.ts', import.meta.url), 'utf8')

// The declaration contains `[]` in its type, so start scanning after the `=`.
const declAt = src.indexOf('export const letters')
const eq = src.indexOf('=', declAt)
let depth = 0
let from = src.indexOf('[', eq)
let end = -1
for (let i = from; i < src.length; i++) {
  if (src[i] === '[') depth++
  else if (src[i] === ']') {
    depth--
    if (depth === 0) {
      end = i
      break
    }
  }
}

const letters = eval(`(${src.slice(from, end + 1)})`)

const MARKS = /[\u0591-\u05C7]/
const stripMarks = (w) => w.replace(/[\u0591-\u05C7]/g, '')

const EXPECTED = new Map([
  ['\u05db', '\u05da'], // kaf  -> final kaf
  ['\u05de', '\u05dd'], // mem  -> final mem
  ['\u05e0', '\u05df'], // nun  -> final nun
  ['\u05e4', '\u05e3'], // pe   -> final pe
  ['\u05e6', '\u05e5'], // tsadi-> final tsadi
])

const failures = []
const check = (ok, message) => {
  if (!ok) failures.push(message)
}

check(letters.length === 22, `expected 22 letters, found ${letters.length}`)

for (const letter of letters) {
  const expectedForm = EXPECTED.get(letter.l)

  if (expectedForm && !letter.final) {
    failures.push(`${letter.l} should have a final form but has none`)
  }
  if (!expectedForm && letter.final) {
    failures.push(`${letter.l} has a final form but should not`)
  }
  if (letter.final && letter.final.form !== expectedForm) {
    failures.push(`${letter.l}: final form is ${letter.final.form}, expected ${expectedForm}`)
  }

  for (const ex of letter.examples) {
    check(MARKS.test(ex.word), `${letter.l}: example "${ex.word}" has no nikud`)
  }

  if (!letter.final) continue
  for (const ex of letter.final.examples) {
    const bare = stripMarks(ex.word)
    const last = bare[bare.length - 1]
    check(
      last === letter.final.form,
      `${letter.l}: final example "${ex.word}" ends in "${last}", expected "${letter.final.form}"`,
    )
    check(MARKS.test(ex.word), `${letter.l}: final example "${ex.word}" has no nikud`)
  }
}

// Emoji uniqueness across the examples the quiz draws from.
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

const finalCount = letters.filter((l) => l.final).length
console.log(`check:data passed — ${letters.length} letters, ${finalCount} with final forms`)
console.log('note: vowel points are present but their correctness is not verified here.')
