import { gridLetters } from '../data/letters'
import { LetterGrid } from '../components/LetterGrid'
import { useAppState } from '../state/AppStateProvider'

/**
 * Screen 1 - the letter hub.
 * Replaces the pre-migration prev/next-only flow, which forced a child to walk
 * the alphabet sequentially to reach any given letter.
 */
export function LetterGridScreen() {
  const { openLetter, speak } = useAppState()

  return (
    <section className="flex h-full min-h-0 flex-col" dir="rtl">
      <p className="shrink-0 px-4 pb-2 text-center text-lg font-bold text-ink/70">
        בְּחַר אוֹת
      </p>
      <LetterGrid
        letters={gridLetters}
        onSelect={(letter) => {
          openLetter(gridLetters.indexOf(letter))
          speak(letter.l, { rate: 0.75, pitch: 1.3 })
        }}
      />
    </section>
  )
}
