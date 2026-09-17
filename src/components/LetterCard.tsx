import { palette } from '../lib/palette'
import type { LetterDatum } from '../data/letters'

type Props = {
  letter: LetterDatum
  /** Marks the item whose practice view is currently open. */
  selected?: boolean
  onSelect: (letter: LetterDatum) => void
}

export function LetterCard({ letter, selected = false, onSelect }: Props) {
  const c = palette[letter.palette]
  const example = letter.examples[0]

  return (
    <button
      type="button"
      onClick={() => onSelect(letter)}
      aria-label={
        letter.final
          ? `האות ${letter.l}, כמו ${example.word}, וּבַסּוֹף ${letter.final.form}`
          : `האות ${letter.l}, כמו ${example.word}`
      }
      aria-current={selected ? 'true' : undefined}
      className={[
        // aspect-square keeps every tile identical; min-h guarantees the
        // 64px touch floor even in a narrow 4-column layout.
        // `w-full` is load-bearing: with width:auto the aspect ratio resolves
        // against min-height, collapsing the card to 64px inside a wider cell.
        'relative flex aspect-square w-full min-h-[64px] select-none touch-manipulation',
        'flex-col items-center justify-center gap-1 rounded-3xl p-2',
        'transition-transform duration-150 ease-out',
        'active:scale-95',
        'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
        'motion-reduce:transition-none',
        'motion-safe:hover:-translate-y-0.5',
        c.soft,
        'shadow-card',
        selected ? `ring-4 ${c.ring}` : '',
      ].join(' ')}
    >
      <span
        className={`text-[clamp(1.75rem,8vw,4.5rem)] font-bold leading-none ${c.deep}`}
      >
        {letter.l}
      </span>
      <span className="text-xl leading-none sm:text-2xl" aria-hidden="true">
        {example.pic}
      </span>

      {/*
        Discovery hint for the five letters that change shape at the end of a
        word. Placed at the inline END of the card - which is the left in RTL,
        the same side a word ends on - and absolutely positioned so it cannot
        affect the card's measured size. aria-hidden because the card's label
        already spells this out.

        Near-neutral ink rather than the letter's own `deep` shade: at 11px this
        is ordinary text needing 4.5:1, and deep-on-soft only manages 4.46 for
        the green letters. An earlier opacity-80 made it worse still (3.23 for
        mem). Ink at 80% clears 7:1 on every tint in the palette.
      */}
      {letter.final && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1 end-1.5 text-[11px] font-bold leading-none text-ink/80"
        >
          {letter.final.form}
        </span>
      )}
    </button>
  )
}
