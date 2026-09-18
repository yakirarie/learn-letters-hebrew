import { useCallback, useEffect, useRef, useState } from 'react'
import { MathExpr } from './MathExpr'
import { SpeakerButton } from './SpeakerButton'
import { WordBuilder } from './WordBuilder'
import { useAppState } from '../state/AppStateProvider'
import { useQuiz } from '../state/QuizSession'
import { isFinished, outOfStrikes, ranOutOfTime, type QuizSession } from '../lib/quiz'

type Outcome = 'done' | 'time' | 'strikes' | null

const PRAISE = 'כֹּל הַכָּבוֹד!'
const RETRY = 'נַסּוּ שׁוּב'

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * The running round. Rendered as a dedicated window: the tab bar is not
 * rendered at all while this is on screen, so the only way out is the quit
 * button - and because the session is saved, quitting is safe rather than
 * destructive.
 *
 * Layout note: the question card is content-sized, not `flex-1`. It used to
 * absorb all the slack, which left the word-build board squeezed into whatever
 * was left over. The slack now goes to the board or the option grid, which is
 * what the child actually interacts with.
 */
export function QuizRunner({ session }: { session: QuizSession }) {
  const { recordAnswer, advance, quit, finish, start } = useQuiz()
  const { speak, soundEnabled } = useAppState()
  const { settings, items, index, score, strikes } = session

  const [feedback, setFeedback] = useState<{
    index: number
    kind: 'correct' | 'wrong'
    text: string
  } | null>(null)
  const [lockedIndex, setLockedIndex] = useState<number | null>(null)
  const pendingRef = useRef<number | null>(null)

  const item = items[index]
  const outcome: Outcome = isFinished(session)
    ? 'done'
    : outOfStrikes(session)
      ? 'strikes'
      : ranOutOfTime(session)
        ? 'time'
        : null
  const over = outcome !== null

  const locked = lockedIndex === index
  const shownFeedback = feedback?.index === index ? feedback : null

  const speakRef = useRef(speak)
  speakRef.current = speak

  useEffect(
    () => () => {
      if (pendingRef.current !== null) window.clearTimeout(pendingRef.current)
    },
    [],
  )

  // Speak each question as it appears. Not when the round is over.
  useEffect(() => {
    if (over || !item) return
    speakRef.current(item.speech, { rate: 0.8, pitch: 1.2 })
  }, [item, over])

  const recordScore = useAppState().recordQuizScore
  useEffect(() => {
    if (over) recordScore(score)
  }, [over, score, recordScore])

  /** Shared by choice answers and word-build completions. */
  const settle = useCallback(
    (correct: boolean) => {
      setLockedIndex(index)
      if (correct) {
        recordAnswer(true)
        setFeedback({ index, kind: 'correct', text: '🎉 מְצֻיָּן!' })
        speakRef.current(PRAISE, { rate: 0.85, pitch: 1.4 })
      } else {
        recordAnswer(false)
        setFeedback({ index, kind: 'wrong', text: '🤔 נַסּוּ שׁוּב' })
        speakRef.current(RETRY, { rate: 0.8, pitch: 1.1 })
      }
      pendingRef.current = window.setTimeout(
        () => {
          setFeedback(null)
          setLockedIndex(null)
          if (correct) advance()
        },
        correct ? 1200 : 1100,
      )
    },
    [index, recordAnswer, advance],
  )

  const answerChoice = (choice: string) => {
    if (locked || over || !item || item.kind === 'build') return
    settle(choice === item.answer)
  }

  const solveBuild = useCallback(() => settle(true), [settle])

  // ---------------------------------------------------------------- summary
  // `over` alone, not `over && !item`: running out of time or strikes ends the
  // round while `index` is still inside the array, so `item` still exists and
  // the summary would never have rendered.
  if (over) {
    const headline =
      outcome === 'time'
        ? 'נִגְמַר הַזְּמַן!'
        : outcome === 'strikes'
          ? 'נִגְמְרוּ הַנִּסָּיוֹנוֹת!'
          : PRAISE
    return (
      <section className="flex h-full min-h-0 flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="animate-bounce-in text-7xl" aria-hidden="true">
          {outcome === 'done' ? '🏆' : '⏰'}
        </span>
        <p className="text-2xl font-bold text-ink sm:text-3xl">{headline}</p>
        <p className="text-xl font-bold text-bubbly-indigo-700">
          צָבַרְתָּ {score} מִתּוֹךְ {items.length} נְקֻדּוֹת
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => start(settings)}
            className="min-h-[64px] select-none touch-manipulation rounded-2xl bg-bubbly-indigo-500 px-6 py-3 text-lg font-bold text-white shadow-card transition-transform duration-150 active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
          >
            🔄 עוֹד פַּעַם
          </button>
          <button
            type="button"
            onClick={finish}
            className="min-h-[64px] select-none touch-manipulation rounded-2xl border-2 border-black/10 bg-white px-6 py-3 text-lg font-bold text-ink shadow-card transition-transform duration-150 active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
          >
            🏠 סִיּוּם
          </button>
        </div>
      </section>
    )
  }

  const limit = settings.timeLimitSec
  const remainingMs = limit === null ? null : limit * 1000 - session.elapsedMs
  const strikesLeft = settings.strikeLimit === null ? null : settings.strikeLimit - strikes

  return (
    <section className="flex h-full min-h-0 flex-col gap-2 px-3 pb-2" dir="rtl">
      {/* status, in one compact row: no running star row to eat the height */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-ink shadow-card">
          שְׁאֵלָה {index + 1} מִתּוֹךְ {items.length}
        </span>
        <span
          className="rounded-full bg-bubbly-indigo-100 px-3 py-1 text-sm font-bold text-bubbly-indigo-700"
          aria-label={`נִקֻּדּוֹת: ${score}`}
        >
          ⭐ {score}
        </span>
        {remainingMs !== null && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              remainingMs <= 10000
                ? 'bg-bubbly-red-100 text-bubbly-red-700'
                : 'bg-white text-ink shadow-card'
            }`}
            aria-label={`זְמַן שֶׁנִּשְׁאַר: ${formatClock(remainingMs)}`}
          >
            ⏱ {formatClock(remainingMs)}
          </span>
        )}
        {strikesLeft !== null && (
          <span
            className="rounded-full bg-white px-3 py-1 text-sm font-bold text-ink shadow-card"
            aria-label={`נִסָּיוֹנוֹת שֶׁנִּשְׁאֲרוּ: ${strikesLeft}`}
          >
            {'❤️'.repeat(Math.max(0, strikesLeft))}
          </span>
        )}
        <button
          type="button"
          onClick={quit}
          aria-label="יְצִיאָה מֵהַחִידּוֹן"
          className="ms-auto flex h-11 w-11 min-h-[44px] min-w-[44px] select-none touch-manipulation items-center justify-center rounded-full border-2 border-black/10 bg-white text-xl font-bold text-ink shadow-card transition-transform duration-150 active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
        >
          ✕
        </button>
      </div>

      <div className="h-2 shrink-0 overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-bubbly-indigo-500 transition-[width] duration-400"
          style={{ width: `${(index / items.length) * 100}%` }}
        />
      </div>

      {/* question card: content-sized, so the board below gets the slack */}
      <div className="flex shrink-0 flex-col items-center gap-1 rounded-3xl border-4 border-bubbly-indigo-500 bg-bubbly-indigo-100 px-3 py-2 shadow-card">
        <p className="text-center text-base font-bold text-ink/70">{item.question}</p>
        <div className="flex items-center justify-center gap-3">
          <p
            className={
              item.promptIsMath
                ? 'text-[clamp(1.75rem,7vmin,3rem)] font-bold leading-none text-bubbly-indigo-700'
                : item.kind === 'count'
                  ? 'max-w-full break-all text-center text-xl leading-tight text-ink'
                  : 'text-[clamp(2.5rem,11vmin,5rem)] leading-none'
            }
            aria-live="polite"
          >
            {item.promptIsMath ? <MathExpr>{item.prompt}</MathExpr> : item.prompt}
          </p>
          <SpeakerButton
            onClick={() => speakRef.current(item.speech, { rate: 0.8, pitch: 1.2 })}
            className={soundEnabled ? '' : 'opacity-40'}
          />
        </div>
        <p className="h-6 text-lg font-bold text-ink" role="status" aria-live="polite">
          {shownFeedback?.text ?? ''}
        </p>
      </div>

      {/* whatever is left goes to the thing the child touches */}
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        {item.kind === 'build' ? (
          <WordBuilder
            key={index}
            target={item.target}
            bank={item.bank}
            disabled={locked}
            onSolved={solveBuild}
            onWrong={() => recordAnswer(false)}
            speak={speak}
          />
        ) : (
          <ul
            role="list"
            className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {item.options.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => answerChoice(option)}
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
      </div>
    </section>
  )
}
