import { useCallback, useEffect, useRef, useState } from 'react'
import { MathExpr } from '../components/MathExpr'
import { useAppState } from '../state/AppStateProvider'
import { letters } from '../data/letters'
import { numbers } from '../data/numbers'
import { buildBank, buildableWords, type BankTile, type BuildWord } from '../lib/spelling'
import { WordBuilder } from '../components/WordBuilder'

type BaseItem = {
  /** Large visual shown as the question. */
  prompt: string
  /** Math prompts must render left-to-right inside the RTL layout. */
  promptIsMath: boolean
  question: string
  speech: string
}

/** A question answered by picking one of four buttons. */
type ChoiceItem = BaseItem & {
  kind: 'letter' | 'count' | 'math'
  options: string[]
  answer: string
}

/** A question answered by spelling the word, in WordBuilder. */
type BuildItem = BaseItem & {
  kind: 'build'
  target: BuildWord
  bank: BankTile[]
}

type QuizItem = ChoiceItem | BuildItem

/**
 * How many questions of each kind, totalling 24 so the round length, the star
 * row and the score denominator all stay as they were.
 *
 * Weighted toward letters, which is what this app is for. Word build counts as
 * a letters exercise: it is spelling with letters, not a numbers exercise.
 *
 *   letters         10 + 6 = 16
 *   numbers & maths  4 + 4 =  8
 */
const PER_KIND = {
  letter: 10,
  build: 6,
  count: 4,
  math: 4,
} as const

/**
 * A Hebrew alphabet app should not spend as much of the quiz on arithmetic as
 * on letters. Asserted at module load so a later tweak to the numbers above
 * fails loudly here rather than quietly shipping an unbalanced quiz.
 */
const LETTER_SKILL_QUESTIONS = PER_KIND.letter + PER_KIND.build
const NUMERIC_QUESTIONS = PER_KIND.count + PER_KIND.math
if (LETTER_SKILL_QUESTIONS <= NUMERIC_QUESTIONS) {
  throw new Error(
    `quiz mix is unbalanced: ${LETTER_SKILL_QUESTIONS} letter questions vs ` +
      `${NUMERIC_QUESTIONS} numbers/maths. Letters must outweigh the rest.`,
  )
}

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Four distinct choices around the answer, clamped to [min, max].
 *
 * The pre-migration version built `[answer, answer+1, answer-1, answer+2]`,
 * clamped each value, then dropped duplicates - so for answer 30 it silently
 * produced fewer than four buttons, and for small answers too. Padding from the
 * remaining range keeps the choice count constant.
 */
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

function buildQuiz(): QuizItem[] {
  const items: QuizItem[] = []

  for (const letterIndex of shuffle([...letters.keys()]).slice(0, PER_KIND.letter)) {
    const datum = letters[letterIndex]
    const example =
      datum.examples[Math.floor(Math.random() * datum.examples.length)]
    const distractors = shuffle(
      letters.filter((_, i) => i !== letterIndex),
    )
      .slice(0, 3)
      .map((l) => l.l)
    items.push({
      kind: 'letter',
      prompt: example.pic,
      promptIsMath: false,
      question: 'בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה?',
      speech: `בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה ${example.word}?`,
      options: shuffle([datum.l, ...distractors]),
      answer: datum.l,
    })
  }

  const countEmojis = ['🍎', '⚽', '🌸', '🐱', '🐟', '🍌', '🍇', '🍓']
  for (const numberIndex of shuffle([...numbers.keys()]).slice(0, PER_KIND.count)) {
    const datum = numbers[numberIndex]
    const emoji = countEmojis[numberIndex % countEmojis.length]
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

  for (let i = 0; i < PER_KIND.math; i++) {
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

  // Word build. Drawn from every example word short enough to spell, which
  // includes the final-letter words - spelling is the one place a final form
  // belongs, since a child spelling מֶלֶךְ needs the ך.
  const pool = letters.map((l) => l.l)
  for (const target of shuffle(buildableWords).slice(0, PER_KIND.build)) {
    items.push({
      kind: 'build',
      prompt: target.pic,
      promptIsMath: false,
      question: 'אֵיךְ כּוֹתְבִים?',
      // The whole question, word included. Naming only the word made the
      // speaker sound like it was answering the question rather than asking it,
      // and the word still has to be in there: without it this tests emoji
      // recall, not spelling.
      speech: `אֵיךְ כּוֹתְבִים ${target.word}?`,
      target,
      bank: buildBank(target, pool),
    })
  }

  return shuffle(items)
}

export function QuizScreen() {
  const { speak, bestQuizScore, recordQuizScore } = useAppState()
  const [items, setItems] = useState<QuizItem[]>(buildQuiz)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  /**
   * Both of these carry the question index they belong to.
   *
   * They used to be plain values reset inside an effect, which left one painted
   * frame where the next question already showed the previous question's
   * "well done" message and had its options disabled. Keying them to the index
   * means they expire during the same render that advances the quiz.
   */
  const [feedback, setFeedback] = useState<{
    index: number
    kind: 'correct' | 'wrong'
    text: string
  } | null>(null)
  const [lockedIndex, setLockedIndex] = useState<number | null>(null)

  const item = items[index]
  const finished = index >= items.length
  const locked = lockedIndex === index
  const shownFeedback = feedback?.index === index ? feedback : null

  const speakRef = useRef(speak)
  speakRef.current = speak

  /**
   * Pending advance/unlock timer, held in a ref so it can be cleared if the
   * screen unmounts mid-answer (switching tabs). Without this the callback
   * fires against an unmounted component - a no-op in React 19, but a leak.
   */
  const pendingRef = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (pendingRef.current !== null) window.clearTimeout(pendingRef.current)
    },
    [],
  )

  useEffect(() => {
    if (finished || !item) return
    speakRef.current(item.speech, { rate: 0.8, pitch: 1.2 })
  }, [item, finished])

  useEffect(() => {
    if (finished) recordQuizScore(score)
  }, [finished, score, recordQuizScore])

  const answer = useCallback(
    (choice: string) => {
      if (locked || !item || item.kind === 'build') return
      setLockedIndex(index)

      if (choice === item.answer) {
        setScore((s) => s + 1)
        setFeedback({ index, kind: 'correct', text: '🎉 מְצֻיָּן!' })
        speakRef.current('כֹּל הַכָּבוֹד!', { rate: 0.85, pitch: 1.4 })
        pendingRef.current = window.setTimeout(() => setIndex((i) => i + 1), 1200)
      } else {
        setFeedback({ index, kind: 'wrong', text: '🤔 נַסּוּ שׁוּב' })
        speakRef.current('נַסּוּ שׁוּב', { rate: 0.8, pitch: 1.1 })
        // Unlock without advancing: the child retries the same question.
        pendingRef.current = window.setTimeout(() => {
          setFeedback(null)
          setLockedIndex(null)
        }, 1100)
      }
    },
    [locked, item, index],
  )

  /**
   * Called by WordBuilder once the word is spelled correctly. Scoring and
   * advancing match a correct choice answer exactly, so the star row, the
   * progress bar and the celebration need to know nothing about this type.
   */
  const solvedBuild = useCallback(() => {
    setScore((s) => s + 1)
    setFeedback({ index, kind: 'correct', text: '🎉 מְצֻיָּן!' })
    // Freezes the board for the pause, exactly as a correct choice disables the
    // option buttons.
    setLockedIndex(index)
    pendingRef.current = window.setTimeout(() => setIndex((i) => i + 1), 1200)
  }, [index])

  const restart = () => {
    if (pendingRef.current !== null) window.clearTimeout(pendingRef.current)
    setItems(buildQuiz())
    setIndex(0)
    setScore(0)
    setFeedback(null)
    setLockedIndex(null)
  }

  if (finished) {
    return (
      <section
        className="flex h-full min-h-0 flex-col items-center justify-center gap-4 px-6 text-center"
        dir="rtl"
      >
        <span className="animate-bounce-in text-7xl" aria-hidden="true">
          🏆
        </span>
        <p className="text-2xl font-bold text-ink sm:text-3xl">
          כֹּל הַכָּבוֹד! סִיַּמְתָּ אֶת הַחִידּוֹן!
        </p>
        <p className="text-xl font-bold text-bubbly-indigo-700">
          צָבַרְתָּ {score} מִתּוֹךְ {items.length} נְקֻדּוֹת
        </p>
        <p className="text-base font-bold text-ink/70">
          הַשִּׂיא שֶׁלְּךָ: {Math.max(bestQuizScore, score)}
        </p>
        <button
          type="button"
          onClick={restart}
          className="min-h-[64px] select-none touch-manipulation rounded-2xl bg-bubbly-indigo-500 px-8 py-4 text-xl font-bold text-white shadow-card transition-transform duration-150 active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
        >
          🔄 עוֹד פַּעַם
        </button>
      </section>
    )
  }

  return (
    <section className="flex h-full min-h-0 flex-col gap-2 px-3 short-landscape:h-auto short-landscape:min-h-full" dir="rtl">
      {/*
        Stars carry the score, the bar carries the position.

        24 stars do not fit a phone in one row: at text-lg each star is ~16px, so
        the row measured 400px of content inside a 366px box and the outermost
        stars were cut off entirely - 2 at 390px, 4 at 360px, 6 at 320px. It now
        wraps and steps down in size, so no star can be clipped. `role="img"`
        gives the score a name that is actually exposed: a bare aria-label on a
        roleless div is ignored by several screen readers, and every star inside
        is aria-hidden.
      */}
      <div className="shrink-0 space-y-1">
        <div
          role="img"
          className="flex flex-wrap justify-center gap-x-0.5 text-sm leading-tight sm:text-base md:text-lg"
          aria-label={`נִקֻדּוֹת: ${score} מִתּוֹךְ ${items.length}`}
        >
          {items.map((_, i) => (
            <span key={i} aria-hidden="true" className={i < score ? '' : 'opacity-30'}>
              {i < score ? '⭐' : '☆'}
            </span>
          ))}
        </div>
        <div className="mx-auto h-2 w-full max-w-sm overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-bubbly-indigo-500 transition-[width] duration-400"
            style={{ width: `${(index / items.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-3xl border-4 border-bubbly-indigo-500 bg-bubbly-indigo-100 p-3 shadow-card">
        <p className="text-center text-base font-bold text-ink/70 sm:text-lg">
          {item.question}
        </p>
        <p
          className={
            item.promptIsMath
              ? 'text-[clamp(2rem,9vmin,3.5rem)] font-bold leading-none text-bubbly-indigo-700'
              : item.kind === 'count'
                ? 'max-w-full break-all text-center text-2xl leading-tight text-ink'
                : 'text-[clamp(3rem,14vmin,6rem)] leading-none'
          }
          aria-live="polite"
        >
          {item.promptIsMath ? <MathExpr>{item.prompt}</MathExpr> : item.prompt}
        </p>
        <p
          className="h-6 text-lg font-bold text-ink"
          role="status"
          aria-live="polite"
        >
          {shownFeedback?.text ?? ''}
        </p>
      </div>

      {item.kind === 'build' ? (
        <WordBuilder
          // Keyed on the question so a new word starts from a clean board.
          key={index}
          target={item.target}
          bank={item.bank}
          disabled={locked}
          onSolved={solvedBuild}
          speak={speak}
        />
      ) : (
      <ul
        role="list"
        className="grid shrink-0 grid-cols-2 gap-2 pb-1 sm:grid-cols-4"
      >
        {item.options.map((option) => (
          <li key={option}>
            <button
              type="button"
              onClick={() => answer(option)}
              disabled={locked}
              className={[
                'flex min-h-[64px] w-full select-none touch-manipulation items-center justify-center',
                'rounded-2xl border-2 border-black/10 bg-white py-3',
                'text-2xl font-bold text-ink shadow-card sm:text-3xl',
                'transition-transform duration-150 ease-out active:scale-95',
                'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
                'disabled:opacity-50 motion-reduce:transition-none',
              ].join(' ')}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      )}
    </section>
  )
}
