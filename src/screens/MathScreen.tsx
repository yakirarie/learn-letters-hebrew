import { useEffect, useRef, useState } from 'react'
import { MathExpr } from '../components/MathExpr'
import { NavButton } from '../components/NavButton'
import { SpeakerButton } from '../components/SpeakerButton'
import { useAppState } from '../state/AppStateProvider'

type Challenge = {
  a: number
  b: number
  op: '+' | '-'
  answer: number
}

const CHALLENGE_COUNT = 15

/**
 * How long the two groups sit apart before the `+` collapses (addition) or the
 * subtracted items fade (subtraction).
 *
 * The pre-migration app waited 2000ms. For the age this is built for that is a
 * long stare at a static picture before anything happens; 1400ms still lets a
 * child read "two groups" without losing them. Change this one constant to
 * retune - the 700ms transition that follows is separate and unchanged.
 */
const SETTLE_DELAY_MS = 1400
const EMOJIS = ['🍎', '⚽', '🌟', '🐱', '🐸', '🍌', '🦋', '🍓', '🐠', '🌈']

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Addition uses two groups of 1-5; subtraction starts from 6-10 so the answer
 * never needs negative numbers or a borrow.
 */
function makeChallenges(): Challenge[] {
  const out: Challenge[] = []
  for (let i = 0; i < CHALLENGE_COUNT; i++) {
    if (Math.random() > 0.5) {
      const a = Math.floor(Math.random() * 5) + 1
      const b = Math.floor(Math.random() * 5) + 1
      out.push({ a, b, op: '+', answer: a + b })
    } else {
      const a = Math.floor(Math.random() * 5) + 6
      const b = Math.floor(Math.random() * 5) + 1
      out.push({ a, b, op: '-', answer: a - b })
    }
  }
  return shuffle(out)
}

function operatorWord(op: '+' | '-'): string {
  return op === '+' ? 'וְעוֹד' : 'פָּחוֹת'
}

export function MathScreen() {
  const { speak } = useAppState()
  const [challenges] = useState(makeChallenges)
  const [index, setIndex] = useState(0)
  /**
   * Which challenge has finished animating.
   *
   * Tracking the index rather than a bare boolean matters: resetting a boolean
   * inside the effect leaves one painted frame in which the new challenge is
   * already shown settled - the subtracted items appear faded before they fade.
   * Deriving from the index resets during the same render that swaps the
   * challenge, so the stale frame never exists.
   */
  const [settledIndex, setSettledIndex] = useState<number | null>(null)
  const settled = settledIndex === index

  const challenge = challenges[index]
  const { a, b, op, answer } = challenge
  const emoji = EMOJIS[index % EMOJIS.length]

  const speakRef = useRef(speak)
  speakRef.current = speak

  useEffect(() => {
    const timer = setTimeout(() => setSettledIndex(index), SETTLE_DELAY_MS)
    speakRef.current(`${a} ${operatorWord(op)} ${b} שָׁוֶה ${answer}`, {
      rate: 0.8,
      pitch: 1.2,
    })
    return () => clearTimeout(timer)
  }, [index, a, b, op, answer])

  const sayEquation = () =>
    speak(`${a} ${operatorWord(op)} ${b} שָׁוֶה ${answer}`, {
      rate: 0.8,
      pitch: 1.2,
    })

  const item = (key: string, faded = false) => (
    <span
      key={key}
      className={`text-2xl leading-none transition-opacity duration-700 sm:text-3xl ${
        faded ? 'opacity-20' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      {emoji}
    </span>
  )

  return (
    <section
      className="flex h-full min-h-0 flex-col gap-2 px-3 short-landscape:h-auto short-landscape:min-h-full short-landscape:flex-row short-landscape:gap-3"
      dir="rtl"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-3xl border-4 border-bubbly-indigo-500 bg-bubbly-indigo-100 p-3 shadow-card short-landscape:gap-1 short-landscape:p-2">
        <p className="text-[clamp(2rem,9vmin,3.5rem)] font-bold leading-none text-bubbly-indigo-700">
          <MathExpr>
            {a} {op} {b} = {answer}
          </MathExpr>
        </p>

        {/*
          Keyed by index so the node remounts when the challenge changes. Without
          this, React reuses the elements and the CSS opacity transition runs
          backwards from the previous challenge's faded state, so the new items
          visibly fade in instead of simply appearing.
        */}
        <div
          key={index}
          className={`flex flex-wrap items-center justify-center transition-[gap] duration-700 ${
            settled && op === '+' ? 'gap-1' : 'gap-4'
          }`}
        >
          {op === '+' ? (
            <>
              <span className="flex max-w-[45%] flex-wrap justify-center gap-1">
                {Array.from({ length: a }, (_, i) => item(`a${i}`))}
              </span>
              {!settled && (
                <span className="text-3xl font-bold text-ink/40" aria-hidden="true">
                  +
                </span>
              )}
              <span className="flex max-w-[45%] flex-wrap justify-center gap-1">
                {Array.from({ length: b }, (_, i) => item(`b${i}`))}
              </span>
            </>
          ) : (
            // Remaining items first, the subtracted ones last, so the fade
            // removes exactly the tail.
            <span className="flex max-w-[80%] flex-wrap justify-center gap-1">
              {Array.from({ length: answer }, (_, i) => item(`k${i}`))}
              {Array.from({ length: b }, (_, i) =>
                item(`x${i}`, settled),
              )}
            </span>
          )}
        </div>

        <SpeakerButton size="lg" onClick={sayEquation} />
      </div>

      <div className="flex shrink-0 justify-between gap-3 pb-1 short-landscape:w-44 short-landscape:flex-col short-landscape:justify-center short-landscape:pb-0">
        <NavButton
          direction="prev"
          onClick={() => setIndex((i) => i - 1)}
          disabled={index === 0}
        />
        <NavButton
          direction="next"
          onClick={() => setIndex((i) => i + 1)}
          disabled={index === challenges.length - 1}
        />
      </div>
    </section>
  )
}
