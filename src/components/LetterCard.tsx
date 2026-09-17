import { palette } from '../lib/palette'
import { spokenName, type LetterDatum } from '../data/letters'

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
      aria-label={`האות ${spokenName(letter)}, כמו ${example.word}`}
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
    </button>
  )
}
