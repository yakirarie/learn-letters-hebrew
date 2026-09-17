import { useEffect, useRef, useState } from 'react'
import { gridLetters } from '../data/letters'
import { palette } from '../lib/palette'
import { useAppState } from '../state/AppStateProvider'
import { NavButton } from '../components/NavButton'
import { SpeakerButton } from '../components/SpeakerButton'

type Props = {
  index: number
  onNavigate: (index: number) => void
}

/**
 * Screen 2 - the letter practice view.
 *
 * Colour roles here follow the same rule as the grid: glyph in `deep` on a
 * `soft` card, with `solid` used only for the border. Painting the glyph in its
 * 500 hex would put shin at 1.56:1 on white, which is what the old app did.
 */
export function LetterPracticeScreen({ index, onNavigate }: Props) {
  const { speak } = useAppState()
  const datum = gridLetters[index]
  const [exampleIndex, setExampleIndex] = useState(0)
  const example = datum.examples[exampleIndex] ?? datum.examples[0]
  const c = palette[datum.palette]

  /*
    Held in a ref rather than listed as an effect dependency: `speak` gets a new
    identity whenever the sound toggle flips, and re-reading the letter because
    someone muted the app would be wrong.
  */
  const speakRef = useRef(speak)
  speakRef.current = speak

  // Speaks once per letter. The pre-migration app re-spoke on every resize or
  // rotation, because it re-ran its whole render routine on window resize.
  useEffect(() => {
    speakRef.current(`${datum.l}! ${datum.l} כְּמוֹ ${datum.examples[0].word}`, {
      rate: 0.75,
      pitch: 1.3,
    })
  }, [datum])

  const speakLetter = () =>
    speak(`${datum.l}! ${datum.l} כְּמוֹ ${example.word}`, {
      rate: 0.75,
      pitch: 1.3,
    })

  const selectExample = (i: number) => {
    setExampleIndex(i)
    const next = datum.examples[i]
    if (next) speak(`${datum.l} כְּמוֹ ${next.word}`, { rate: 0.75, pitch: 1.3 })
  }

  return (
    <section
      className="flex h-full min-h-0 flex-col gap-2 px-3 short-landscape:h-auto short-landscape:min-h-full short-landscape:flex-row short-landscape:gap-3"
      dir="rtl"
    >
      <div
        className={`flex min-h-0 flex-1 flex-col items-center justify-center gap-1 rounded-3xl border-4 p-2 shadow-card sm:gap-2 sm:p-3 short-landscape:gap-1 short-landscape:p-2 ${c.soft} ${c.edge}`}
      >
        <button
          type="button"
          onClick={speakLetter}
          aria-label={`הַשְׁמַע אֶת הָאוֹת ${datum.l}`}
          className="select-none touch-manipulation rounded-3xl px-3 transition-transform duration-150 ease-out active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
        >
          {/*
            Keyed on the letter so the node remounts and the pop animation
            replays on every navigation. Without the key React would reuse the
            element and the animation would only ever run once.
          */}
          <span
            key={datum.l}
            className={`block animate-pop text-[clamp(4.5rem,30vmin,12rem)] font-bold leading-none short-landscape:text-[clamp(2.5rem,16vh,5rem)] ${c.deep}`}
          >
            {datum.l}
          </span>
        </button>

        <p
          key={`${datum.l}-${example.word}`}
          className="flex animate-bounce-in items-center gap-2 text-center text-xl font-bold text-ink sm:text-3xl short-landscape:text-lg"
          aria-live="polite"
        >
          <span className="text-2xl sm:text-4xl short-landscape:text-xl" aria-hidden="true">
            {example.pic}
          </span>
          {example.word}
        </p>

        <SpeakerButton size="lg" onClick={speakLetter} />
      </div>

      {/*
        In landscape these become the second column, beside the hero card,
        because a ~390px-tall viewport cannot stack a hero plus controls
        without clipping them.
      */}
      <div className="flex shrink-0 flex-col gap-2 short-landscape:flex-1 short-landscape:justify-center">
        <ul
          role="list"
          className="flex shrink-0 flex-wrap justify-center gap-2"
        >
          {datum.examples.map((ex, i) => {
          const isActive = i === exampleIndex
          return (
            <li key={ex.word}>
              <button
                type="button"
                onClick={() => selectExample(i)}
                aria-label={ex.word}
                aria-pressed={isActive}
                className={[
                  'flex h-16 w-16 min-h-[64px] min-w-[64px] select-none touch-manipulation',
                  'items-center justify-center rounded-2xl border-2 bg-white',
                  'transition-transform duration-150 ease-out active:scale-95',
                  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
                  'motion-reduce:transition-none',
                  isActive ? `${c.edge} ring-2 ${c.ring}` : 'border-black/10',
                ].join(' ')}
              >
                <span className="text-3xl" aria-hidden="true">
                  {ex.pic}
                </span>
              </button>
            </li>
          )
        })}
        </ul>

        <div className="flex shrink-0 justify-between gap-3 pb-1">
          <NavButton
            direction="prev"
            onClick={() => onNavigate(index - 1)}
            disabled={index === 0}
          />
          <NavButton
            direction="next"
            onClick={() => onNavigate(index + 1)}
            disabled={index === gridLetters.length - 1}
          />
        </div>
      </div>
    </section>
  )
}
