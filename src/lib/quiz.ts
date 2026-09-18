import { letters } from '../data/letters'
import { numbers } from '../data/numbers'
import {
  buildBank,
  buildableWords,
  type BankTile,
  type BuildWord,
} from './spelling'

/**
 * Word build is now the only letters exercise: the "which letter does this word
 * start with?" question is gone, because spelling the word tests the same
 * knowledge more thoroughly and without an ambiguous prompt.
 */

export type QuizSettings = {
  /** How many questions the round holds. */
  questions: number
  /** Seconds allowed, or null for no limit. */
  timeLimitSec: number | null
  /** Wrong answers tolerated, or null for no limit. */
  strikeLimit: number | null
}

export const DEFAULT_SETTINGS: QuizSettings = {
  questions: 10,
  timeLimitSec: null,
  strikeLimit: null,
}

export const QUESTION_CHOICES = [5, 10, 15, 20] as const
export const TIME_CHOICES = [null, 60, 120, 300] as const
export const STRIKE_CHOICES = [null, 3, 5] as const

type BaseItem = {
  /** Large visual shown as the question. */
  prompt: string
  /** Math prompts must render left-to-right inside the RTL layout. */
  promptIsMath: boolean
  question: string
  speech: string
}

/** A question answered by picking one of four buttons. */
export type ChoiceItem = BaseItem & {
  kind: 'count' | 'math'
  options: string[]
  answer: string
}

/** A question answered by spelling the word, in WordBuilder. */
export type BuildItem = BaseItem & {
  kind: 'build'
  target: BuildWord
  bank: BankTile[]
}

export type QuizItem = ChoiceItem | BuildItem

/**
 * Share of a round given to word build. The remainder is split evenly between
 * counting and maths. Named so scripts/check-data.mjs can read the ratio back
 * out of this file rather than keeping its own copy of the number.
 */
export const BUILD_SHARE = 0.6

/**
 * How many of each kind a round of `n` contains.
 *
 * Word build is the letters side now, and it has to outweigh counting and
 * maths together - this is a Hebrew alphabet app. `Math.ceil` rather than round
 * matters at the small end: at n=5 rounding gives 2 build against 2 numeric,
 * which is not a majority.
 *
 *   n=5  -> 3 / 1 / 1      n=10 -> 6 / 2 / 2
 *   n=15 -> 9 / 3 / 3      n=20 -> 12 / 4 / 4
 */
export function mixFor(n: number): { build: number; count: number; math: number } {
  const build = Math.ceil(n * BUILD_SHARE)
  const rest = n - build
  const count = Math.ceil(rest / 2)
  const math = rest - count
  return { build, count, math }
}

/** True when word build outweighs numbers and maths for a round of `n`. */
export function mixIsBalanced(n: number): boolean {
  const { build, count, math } = mixFor(n)
  return build > count + math
}

// The offered sizes must all be balanced. Checked at module load so a change to
// the ratio fails loudly here rather than shipping a letters-light quiz.
for (const n of QUESTION_CHOICES) {
  if (!mixIsBalanced(n)) {
    throw new Error(`quiz mix is unbalanced at ${n} questions: ${JSON.stringify(mixFor(n))}`)
  }
}

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Four distinct choices around the answer, clamped to [min, max]. */
function makeOptions(answer: number, min: number, max: number): string[] {
  const picks = new Set<number>([answer])
  for (const candidate of [answer + 1, answer - 1, answer + 2, answer - 2]) {
    if (picks.size >= 4) break
    if (candidate >= min && candidate <= max) picks.add(candidate)
  }
  let filler = min
  while (picks.size < 4 && filler <= max) {
    picks.add(filler)
    filler++
  }
  return shuffle([...picks]).map(String)
}

const COUNT_EMOJIS = ['🍎', '⚽', '🌸', '🐱', '🐟', '🍌', '🍇', '🍓']

export function buildQuiz(settings: QuizSettings): QuizItem[] {
  const { build, count, math } = mixFor(settings.questions)
  const items: QuizItem[] = []

  // Word build. Drawn from every example word short enough to spell, which
  // includes the final-letter words - spelling is where a final form belongs.
  const pool = letters.map((l) => l.l)
  for (const target of shuffle(buildableWords).slice(0, build)) {
    items.push({
      kind: 'build',
      prompt: target.pic,
      promptIsMath: false,
      question: 'אֵיךְ כּוֹתְבִים?',
      // The whole question, word included: naming only the word sounded like the
      // speaker answering rather than asking.
      speech: `אֵיךְ כּוֹתְבִים ${target.word}?`,
      target,
      bank: buildBank(target, pool),
    })
  }

  for (const numberIndex of shuffle([...numbers.keys()]).slice(0, count)) {
    const datum = numbers[numberIndex]
    const emoji = COUNT_EMOJIS[numberIndex % COUNT_EMOJIS.length]
    items.push({
      kind: 'count',
      prompt: emoji.repeat(datum.n),
      promptIsMath: false,
      question: 'כַּמָּה פְּרִיטִים יֵשׁ כָּאן?',
      speech: 'כַּמָּה פְּרִיטִים יֵשׁ כָּאן?',
      options: makeOptions(datum.n, 1, 30),
      answer: String(datum.n),
    })
  }

  for (let i = 0; i < math; i++) {
    let a: number
    let b: number
    let op: '+' | '-'
    let answer: number
    if (Math.random() > 0.5) {
      a = Math.floor(Math.random() * 5) + 1
      b = Math.floor(Math.random() * 5) + 1
      op = '+'
      answer = a + b
    } else {
      a = Math.floor(Math.random() * 5) + 6
      b = Math.floor(Math.random() * 5) + 1
      op = '-'
      answer = a - b
    }
    const word = op === '+' ? 'וְעוֹד' : 'פָּחוֹת'
    items.push({
      kind: 'math',
      prompt: `${a} ${op} ${b} = ?`,
      promptIsMath: true,
      question: 'כַּמָּה זֶה?',
      speech: `${a} ${word} ${b} שָׁוֶה?`,
      options: makeOptions(answer, 0, 20),
      answer: String(answer),
    })
  }

  return shuffle(items)
}

// ---------------------------------------------------------------- the session

export const QUIZ_VERSION = 1

export type QuizSession = {
  /**
   * Shape version. A save from an older build is discarded rather than parsed,
   * so a change to QuizItem can never crash the app on load.
   */
  version: number
  settings: QuizSettings
  /**
   * The generated questions, including each build question's letter bank.
   * Persisted rather than regenerated: rebuilding would reshuffle mid-round and
   * change the bank a child is halfway through spelling with.
   */
  items: QuizItem[]
  index: number
  score: number
  /** Wrong answers so far, against settings.strikeLimit. */
  strikes: number
  /**
   * Time spent with the quiz actually on screen, accumulated.
   *
   * Deliberately not a deadline timestamp: a wall-clock limit would expire while
   * the app was closed and punish a child for going to dinner.
   */
  elapsedMs: number
  /** When the round began, for the resume prompt's wording. */
  startedAt: number
}

export function newSession(settings: QuizSettings): QuizSession {
  return {
    version: QUIZ_VERSION,
    settings,
    items: buildQuiz(settings),
    index: 0,
    score: 0,
    strikes: 0,
    elapsedMs: 0,
    startedAt: Date.now(),
  }
}

export function isFinished(session: QuizSession): boolean {
  return session.index >= session.items.length
}

export function ranOutOfTime(session: QuizSession): boolean {
  const limit = session.settings.timeLimitSec
  return limit !== null && session.elapsedMs >= limit * 1000
}

export function outOfStrikes(session: QuizSession): boolean {
  const limit = session.settings.strikeLimit
  return limit !== null && session.strikes >= limit
}

/**
 * localStorage is untrusted input, and this one is a large object rather than a
 * handful of primitives, so it is checked structurally and rejected whole if it
 * does not look right. A rejected save means a fresh setup screen, never a
 * crash.
 */
export function parseSession(value: unknown): QuizSession | null {
  if (typeof value !== 'object' || value === null) return null
  const s = value as Partial<QuizSession>
  if (s.version !== QUIZ_VERSION) return null
  if (!Array.isArray(s.items) || s.items.length === 0) return null
  if (typeof s.index !== 'number' || s.index < 0) return null
  if (typeof s.score !== 'number' || s.score < 0) return null
  if (typeof s.strikes !== 'number' || s.strikes < 0) return null
  if (typeof s.elapsedMs !== 'number' || s.elapsedMs < 0) return null
  if (typeof s.startedAt !== 'number') return null

  const settings = s.settings as Partial<QuizSettings> | undefined
  if (!settings || typeof settings.questions !== 'number') return null
  const numOrNull = (v: unknown) =>
    v === null || v === undefined ? null : typeof v === 'number' && v > 0 ? v : null

  for (const item of s.items) {
    if (typeof item !== 'object' || item === null) return null
    const i = item as Partial<QuizItem>
    if (i.kind !== 'build' && i.kind !== 'count' && i.kind !== 'math') return null
    if (typeof i.prompt !== 'string' || typeof i.speech !== 'string') return null
    if (i.kind === 'build') {
      const b = i as Partial<BuildItem>
      if (!b.target || !Array.isArray(b.bank) || b.bank.length === 0) return null
    } else {
      const c = i as Partial<ChoiceItem>
      if (!Array.isArray(c.options) || c.options.length === 0) return null
      if (typeof c.answer !== 'string') return null
    }
  }

  return {
    version: QUIZ_VERSION,
    settings: {
      questions: settings.questions,
      timeLimitSec: numOrNull(settings.timeLimitSec),
      strikeLimit: numOrNull(settings.strikeLimit),
    },
    items: s.items,
    index: s.index,
    score: s.score,
    strikes: s.strikes,
    elapsedMs: s.elapsedMs,
    startedAt: s.startedAt,
  }
}
