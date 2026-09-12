import { LetterCard } from './LetterCard'
import type { LetterDatum } from '../data/letters'

type Props = {
  letters: LetterDatum[]
  selectedLetter?: string
  onSelect: (letter: LetterDatum) => void
}

/**
 * The letter hub.
 *
 * `overscroll-contain` stops a scroll that reaches the end of the grid from
 * chaining out to the page, and the safe-area padding keeps the last row clear
 * of the home indicator on notched devices.
 */
export function LetterGrid({ letters, selectedLetter, onSelect }: Props) {
  return (
    <ul
      className="mx-auto grid w-full max-w-6xl grid-cols-4 gap-4 overflow-y-auto
                 overscroll-contain px-3 pt-2
                 sm:grid-cols-5
                 lg:max-w-[1120px] lg:grid-cols-7 lg:gap-6"
      style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
    >
      {letters.map((letter) => (
        <li key={letter.l}>
          <LetterCard
            letter={letter}
            selected={selectedLetter === letter.l}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  )
}
