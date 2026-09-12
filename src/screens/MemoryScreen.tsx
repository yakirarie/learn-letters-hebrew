import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { letters } from '../data/letters'
import { numbers } from '../data/numbers'
import { palette, type PaletteKey } from '../lib/palette'
import { useAppState } from '../state/AppStateProvider'

type Card = {
  /** Shared by both cards of a pair. */
  id: string
  display: string
  palette: PaletteKey
  category: 'letter' | 'number' | 'picture'
  matched: boolean
}

const PAIRS = 10
const PICTURE_POOL_LIMIT = 13

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Hebrew word for a picture, so flipping a picture card speaks its meaning. */
function wordForPicture(pic: string): string | null {
  for (const letter of letters) {
    const example = letter.examples.find((e) => e.pic === pic)
    if (example) return example.word
  }
  return null
}

function buildDeck(): Card[] {
  const pool: Omit<Card, 'matched'>[] = []

  for (const i of shuffle([...letters.keys()]).slice(0, 5)) {
    pool.push({
      id: `l_${letters[i].l}`,
      display: letters[i].l,
      palette: letters[i].palette,
      category: 'letter',
    })
  }

  for (const i of shuffle([...numbers.keys()]).slice(0, 5)) {
    pool.push({
      id: `n_${numbers[i].n}`,
      display: String(numbers[i].n),
      palette: numbers[i].palette,
      category: 'number',
    })
  }

  const usedPics = new Set<string>()
  for (const letter of shuffle([...letters])) {
    if (pool.length >= PICTURE_POOL_LIMIT) break
    const example = letter.examples[0]
    if (usedPics.has(example.pic)) continue
    usedPics.add(example.pic)
    pool.push({
      id: `p_${example.pic}`,
      display: example.pic,
      palette: letter.palette,
      category: 'picture',
    })
  }

  const chosen = shuffle(pool).slice(0, PAIRS)
  const deck = chosen.flatMap((card) => [
    { ...card, matched: false },
    { ...card, matched: false },
  ])
  return shuffle(deck)
}

export function MemoryScreen() {
  const { speak } = useAppState()
  const [deck, setDeck] = useState<Card[]>(buildDeck)
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)

  const speakRef = useRef(speak)
  speakRef.current = speak

  const matchedPairs = useMemo(
    () => deck.filter((c) => c.matched).length / 2,
    [deck],
  )
  const solved = matchedPairs === PAIRS

  const newGame = useCallback(() => {
    setDeck(buildDeck())
    setFlipped([])
    setMoves(0)
    setLocked(false)
  }, [])

  const flip = (index: number) => {
    if (locked || deck[index].matched || flipped.includes(index)) return

    const card = deck[index]
    if (card.category === 'picture') {
      const word = wordForPicture(card.display)
      speakRef.current(word ?? '', { rate: 0.8, pitch: 1.3 })
    } else if (card.category === 'letter') {
      speakRef.current(card.display, { rate: 0.8, pitch: 1.3 })
    } else {
      speakRef.current(card.display, { rate: 0.8, pitch: 1.2 })
    }

    setFlipped((f) => [...f, index])
  }

  // Resolve a pair once two cards are face up. Living in an effect (rather than
  // a bare setTimeout inside the click handler) means the timer is torn down if
  // the component unmounts or a new game starts mid-flip.
  useEffect(() => {
    if (flipped.length !== 2) return
    const [first, second] = flipped
    setMoves((m) => m + 1)
    setLocked(true)

    const isPair = deck[first].id === deck[second].id
    if (isPair) {
      setDeck((cards) =>
        cards.map((c, i) =>
          i === first || i === second ? { ...c, matched: true } : c,
        ),
      )
      speakRef.current('כָּל הַכָּבוֹד! זוּג!', { rate: 0.85, pitch: 1.4 })
      setFlipped([])
      setLocked(false)
      return
    }

    const timer = window.setTimeout(() => {
      setFlipped([])
      setLocked(false)
    }, 900)
    return () => window.clearTimeout(timer)
  }, [flipped, deck])

  useEffect(() => {
    if (solved) {
      speakRef.current('מַדְהִים! מָצָאתָ אֶת כָּל הַזּוּגוֹת!', {
        rate: 0.8,
        pitch: 1.4,
      })
    }
  }, [solved])

  return (
    <section className="flex h-full min-h-0 flex-col gap-2 px-3 short-landscape:h-auto short-landscape:min-h-full" dir="rtl">
      <p className="shrink-0 text-center text-base font-bold text-ink" aria-live="polite">
        {solved
          ? `🏆 מְעֻלֶּה! ${moves} מַהֲלָכִים בְּסֵךְ הַכֹּל!`
          : `זוּגוֹת: ${matchedPairs}/${PAIRS}  •  מַהֲלָכִים: ${moves}`}
      </p>

      <ul className="mx-auto grid min-h-0 w-full max-w-3xl flex-1 grid-cols-4 content-start gap-2 overflow-y-auto overscroll-contain sm:grid-cols-5 short-landscape:grid-cols-8">
        {deck.map((card, i) => {
          const faceUp = card.matched || flipped.includes(i)
          const c = palette[card.palette]
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => flip(i)}
                disabled={faceUp || locked}
                aria-label={
                  faceUp
                    ? `${card.display}`
                    : 'קַלְפִּית סְגוּרָה'
                }
                className={[
                  'flex aspect-square w-full min-h-[64px] select-none touch-manipulation',
                  'items-center justify-center rounded-2xl border-2',
                  'transition-transform duration-150 ease-out active:scale-95',
                  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
                  'motion-reduce:transition-none',
                  faceUp
                    ? `${c.soft} ${c.edge}`
                    : 'border-black/10 bg-white shadow-card',
                  card.matched ? 'opacity-60' : '',
                ].join(' ')}
              >
                <span
                  className={
                    faceUp
                      ? `text-[clamp(1.75rem,7vw,2.75rem)] font-bold leading-none ${c.deep}`
                      : 'text-[clamp(1.75rem,7vw,2.75rem)] font-bold leading-none text-ink/20'
                  }
                >
                  {faceUp ? card.display : '?'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex shrink-0 justify-center pb-1">
        <button
          type="button"
          onClick={newGame}
          className="min-h-[64px] select-none touch-manipulation rounded-2xl bg-bubbly-blue-500 px-8 py-3 text-lg font-bold text-white shadow-card transition-transform duration-150 active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
        >
          🔄 מִשְׂחָק חָדָשׁ
        </button>
      </div>
    </section>
  )
}
