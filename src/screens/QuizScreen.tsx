import { useState } from 'react'
import { QuizRunner } from '../components/QuizRunner'
import {
  DEFAULT_SETTINGS,
  QUESTION_CHOICES,
  STRIKE_CHOICES,
  TIME_CHOICES,
  type QuizSettings,
} from '../lib/quiz'
import { useQuiz } from '../state/QuizSession'

const chipClass = (selected: boolean) =>
  [
    'min-h-[56px] select-none touch-manipulation rounded-2xl border-2 px-4',
    'text-base font-bold transition-transform duration-150 ease-out active:scale-95',
    'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
    'motion-reduce:transition-none',
    selected
      ? 'border-transparent bg-bubbly-indigo-500 text-white shadow-card'
      : 'border-black/10 bg-white text-ink',
  ].join(' ')

function Row<T extends string | number | null>({
  title,
  options,
  value,
  onChange,
  describe,
}: {
  title: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  describe: (v: T) => string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="px-1 text-sm font-bold text-ink/70">{title}</span>
      <ul role="list" className="flex flex-wrap gap-2">
        {options.map((option) => (
          <li key={String(option)}>
            <button
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={value === option}
              className={chipClass(value === option)}
            >
              {describe(option)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The quiz lobby.
 *
 * Start is the dominant action and the defaults are playable as-is, because the
 * child may not read: a child who taps the quiz tab and then the big button
 * gets a sensible 10-question round. The three settings are chips rather than
 * steppers so nothing needs dragging, and every one of them is optional.
 */
export function QuizScreen() {
  const { session, parked, start, resume } = useQuiz()
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS)

  if (session) return <QuizRunner session={session} />

  return (
    <section
      className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain px-3 pb-4"
      dir="rtl"
    >
      {parked && (
        <button
          type="button"
          onClick={resume}
          className="flex shrink-0 items-center justify-between gap-3 rounded-3xl border-4 border-bubbly-green-500 bg-bubbly-green-100 p-3 text-start shadow-card transition-transform duration-150 active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
        >
          <span className="flex flex-col">
            <span className="text-lg font-bold text-bubbly-green-700">
              ▶ הַמְשֵׁךְ אֶת הַחִידּוֹן
            </span>
            <span className="text-sm font-bold text-ink/70">
              שְׁאֵלָה {parked.index + 1} מִתּוֹךְ {parked.items.length} · ⭐ {parked.score}
            </span>
          </span>
          <span className="text-3xl" aria-hidden="true">
            🎯
          </span>
        </button>
      )}

      <Row
        title="כַּמָּה שְׁאֵלוֹת?"
        options={QUESTION_CHOICES}
        value={settings.questions}
        onChange={(questions) => setSettings((s) => ({ ...s, questions }))}
        describe={(n) => String(n)}
      />

      <Row
        title="הַגְבָּלַת זְמַן?"
        options={TIME_CHOICES}
        value={settings.timeLimitSec}
        onChange={(timeLimitSec) => setSettings((s) => ({ ...s, timeLimitSec }))}
        describe={(v) => (v === null ? 'אֵין' : v < 60 ? `${v} שְׁנִיּוֹת` : `${v / 60} דַּקּוֹת`)}
      />

      <Row
        title="כַּמָּה נִסָּיוֹנוֹת?"
        options={STRIKE_CHOICES}
        value={settings.strikeLimit}
        onChange={(strikeLimit) => setSettings((s) => ({ ...s, strikeLimit }))}
        describe={(v) => (v === null ? 'אֵין' : String(v))}
      />

      <button
        type="button"
        onClick={() => start(settings)}
        className="mt-auto flex min-h-[72px] shrink-0 select-none touch-manipulation items-center justify-center gap-2 rounded-3xl bg-bubbly-indigo-500 px-6 py-4 text-2xl font-bold text-white shadow-card transition-transform duration-150 active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
      >
        <span aria-hidden="true">▶</span> הַתְחֵל
      </button>
    </section>
  )
}
