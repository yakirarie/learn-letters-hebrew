import { useEffect, useRef, useState } from 'react'
import { numbers } from '../data/numbers'
import { emojiForIndex, numberWithObject } from '../lib/counting'
import { palette } from '../lib/palette'
import { useAppState } from '../state/AppStateProvider'
import { NavButton } from '../components/NavButton'
import { SpeakerButton } from '../components/SpeakerButton'

/**
 * Numbers 1-30.
 *
 * The visual is the object count itself, which is the point of the screen: the
 * numeral is abstract, thirty apples are not.
 */
export function NumbersScreen() {
  const { speak } = useAppState()
  const [index, setIndex] = useState(0)
  const datum = numbers[index]
  const emoji = emojiForIndex(index)
  const phrase = numberWithObject(emoji, datum.n, datum.word)
  const c = palette[datum.palette]

  const speakRef = useRef(speak)
  speakRef.current = speak

  useEffect(() => {
    speakRef.current(`${datum.n}. ${phrase}`, { rate: 0.8, pitch: 1.2 })
  }, [datum, phrase])

  const repeat = () =>
    speak(`${datum.n}. ${phrase}`, { rate: 0.8, pitch: 1.2 })

  // Emoji grow toward the sizes the pre-migration app used (40px / 24px), because
  // counting is easier when each item is large. Sized down only as far as the
  // count actually requires: 10 items at 36px wrap to two rows on a phone.
  const emojiSize =
    datum.n > 20 ? 'text-xl' : datum.n > 10 ? 'text-2xl' : 'text-4xl'

  return (
    <section
      className="flex h-full min-h-0 flex-col gap-2 px-3 short-landscape:h-auto short-landscape:min-h-full short-landscape:flex-row short-landscape:gap-3"
      dir="rtl"
    >
      <div
        className={`flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-3xl border-4 p-3 shadow-card short-landscape:gap-1 short-landscape:p-2 ${c.soft} ${c.edge}`}
      >
        <div className="flex w-full flex-1 items-center justify-center overflow-hidden">
          <p
            className={`max-w-full break-all text-center leading-tight ${emojiSize}`}
            aria-hidden="true"
          >
            {emoji.repeat(datum.n)}
          </p>
        </div>

        <p
          key={datum.n}
          className={`animate-pop text-[clamp(3rem,16vmin,6rem)] font-bold leading-none ${c.deep}`}
        >
          {datum.n}
        </p>

        <p
          key={`w-${datum.n}`}
          className="animate-bounce-in text-center text-xl font-bold text-ink sm:text-3xl"
          aria-live="polite"
        >
          {phrase}
        </p>

        <SpeakerButton size="lg" onClick={repeat} />
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
          disabled={index === numbers.length - 1}
        />
      </div>
    </section>
  )
}
