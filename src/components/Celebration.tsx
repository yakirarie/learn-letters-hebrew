import { useEffect, useMemo, useState } from 'react'

/** True when the user has asked for less motion. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

const COLOURS = [
  'bg-bubbly-red-500',
  'bg-bubbly-orange-500',
  'bg-bubbly-yellow-500',
  'bg-bubbly-green-500',
  'bg-bubbly-cyan-500',
  'bg-bubbly-blue-500',
  'bg-bubbly-purple-500',
  'bg-bubbly-pink-500',
]

type Piece = {
  left: number
  delay: number
  duration: number
  size: number
  colour: string
  drift: number
}

/**
 * A one-shot confetti burst for finishing a round.
 *
 * Pure DOM, no dependency and no image assets. Not rendered at all when the user
 * prefers reduced motion - a screen full of falling shapes is exactly what that
 * setting is asking us not to do. The global stylesheet also neutralises
 * animations, but a static field of confetti would look like debris, so this
 * opts out at the source instead.
 */
export function Confetti({ pieces = 28 }: { pieces?: number }) {
  const reduced = usePrefersReducedMotion()
  const items = useMemo<Piece[]>(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: (i * 97) % 100,
        delay: ((i * 37) % 60) / 100,
        duration: 2.2 + ((i * 53) % 90) / 100,
        size: 8 + ((i * 29) % 10),
        colour: COLOURS[i % COLOURS.length],
        drift: ((i * 41) % 80) - 40,
      })),
    [pieces],
  )

  if (reduced) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {items.map((piece, i) => (
        <span
          key={i}
          className={`animate-confetti absolute top-0 block rounded-[2px] ${piece.colour}`}
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 1.6,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            // A per-piece horizontal drift keeps it from looking like a comb.
            ['--drift' as string]: `${piece.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
