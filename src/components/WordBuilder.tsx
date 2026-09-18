import { useCallback, useEffect, useRef, useState } from 'react'
import {
  isSpelledCorrectly,
  type BankTile,
  type BuildWord,
} from '../lib/spelling'
import type { SpeakOptions } from '../lib/speech'

type Props = {
  target: BuildWord
  /** Every tile for this word: its letters plus the distractors. */
  bank: BankTile[]
  /** True while the quiz is advancing, so nothing can be moved. */
  disabled?: boolean
  /** Called once the word is spelled correctly. */
  onSolved: () => void
  speak: (text: string, options?: SpeakOptions) => void
}

type DragState = {
  tile: BankTile
  /** Which slot it came from, or 'bank' if it started in the letter bank. */
  from: number | 'bank'
  x: number
  y: number
  /** The slot currently under the finger. */
  over: number | null
}

/** Below this a pointer press is a tap, not a drag. */
const DRAG_THRESHOLD_PX = 8

const SLOT_SIZE = 'h-[min(3.5rem,14vw)] w-[min(3.5rem,14vw)]'
const TILE_SIZE = 'h-[min(3.25rem,13vw)] w-[min(3.25rem,13vw)]'

const PRAISE = 'כֹּל הַכָּבוֹד!'
const RETRY = 'נַסּוּ שׁוּב'

/**
 * Word build: an emoji, one box per letter, and a bank of letters to place.
 *
 * Tap a tile and it fills the first empty box. Drag a tile and it lands in the
 * box you drop it on; drop it on an occupied box and the letter already there
 * goes back to the bank. Tapping a filled box sends it back, so a mis-tap is
 * always recoverable - tap is the primary interaction for a small child and
 * drag is the enhancement on top of it.
 *
 * Drag uses pointer events, not HTML5 drag-and-drop: HTML5 DnD does not fire on
 * touch at all, so it would pass every desktop test and be dead on a phone.
 */
export function WordBuilder({ target, bank, disabled = false, onSolved, speak }: Props) {
  const [placed, setPlaced] = useState<(BankTile | null)[]>(() =>
    target.letters.map(() => null),
  )
  /** Which slots were correct at the last check. Those stay and stay green. */
  const [confirmed, setConfirmed] = useState<number[]>([])
  /** Slots to paint red: wrong at the last check. */
  const [wrong, setWrong] = useState<number[]>([])
  const [drag, setDrag] = useState<DragState | null>(null)

  const startRef = useRef<{ x: number; y: number; tile: BankTile; from: number | 'bank' } | null>(null)
  /**
   * The in-flight drag is mirrored in a ref.
   *
   * The window listeners below are registered once and read from here. They used
   * to take `drag` as an effect dependency, which meant every pointermove tore
   * the listeners down and re-registered them, and - worse - they did not exist
   * at all until React had committed the state change from the FIRST move. A
   * touch browser routinely coalesces the move and the up into one task, so the
   * up arrived before any listener was attached, `drag` never cleared and the
   * tile stayed hovering on screen.
   */
  const dragRef = useRef<DragState | null>(null)
  const confirmedRef = useRef<number[]>([])
  confirmedRef.current = confirmed
  const draggingRef = useRef(false)
  const suppressClickRef = useRef(false)
  const settledRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const placedIds = new Set(placed.filter(Boolean).map((t) => t!.id))
  const bankTiles = bank.filter((t) => !placedIds.has(t.id))

  /** Drop a tile into a slot, returning whatever was there to the bank. */
  const dropInto = useCallback(
    (slot: number, tile: BankTile, from: number | 'bank') => {
      setPlaced((prev) => {
        const next = [...prev]
        if (from !== 'bank') next[from] = null // moving out of another slot
        next[slot] = tile // whatever was in `slot` simply becomes unplaced
        return next
      })
      setWrong([])
      setConfirmed((c) => c.filter((i) => i !== slot))
    },
    [],
  )

  const sendBack = useCallback((slot: number) => {
    setPlaced((prev) => {
      const next = [...prev]
      next[slot] = null
      return next
    })
    setWrong([])
    setConfirmed((c) => c.filter((i) => i !== slot))
  }, [])

  const applyDrag = (next: DragState | null) => {
    dragRef.current = next
    setDrag(next)
  }

  const slotAt = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y)
    const slotEl = el?.closest?.('[data-slot]')
    return slotEl ? Number(slotEl.getAttribute('data-slot')) : null
  }

  /**
   * Finish a drag. Idempotent, so the tile's own handler and the window
   * listener can both call it without double-placing.
   *
   * `cancelled` matters on touch: a pointercancel means the browser took the
   * gesture for itself (a scroll, a system gesture), and dropping the letter
   * wherever the finger happened to be would be a surprise. It goes back.
   */
  const endDrag = useCallback(
    (x: number, y: number, cancelled: boolean) => {
      const d = dragRef.current
      if (!d) return
      applyDrag(null)
      draggingRef.current = false
      startRef.current = null
      suppressClickRef.current = true
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
      if (cancelled) {
        if (d.from !== 'bank') sendBack(d.from)
        return
      }
      const slot = slotAt(x, y)
      if (slot !== null && !confirmedRef.current.includes(slot)) {
        dropInto(slot, d.tile, d.from)
      } else if (d.from !== 'bank') {
        sendBack(d.from)
      }
    },
    [dropInto, sendBack],
  )

  const placeInFirstEmpty = (tile: BankTile, from: number | 'bank') => {
    const slot = placed.findIndex((t, i) => t === null && !confirmed.includes(i))
    if (slot === -1) return
    dropInto(slot, tile, from)
  }

  // ---- evaluate once every box is filled ----------------------------------
  useEffect(() => {
    if (settledRef.current) return
    if (placed.some((t) => t === null)) return

    if (isSpelledCorrectly(placed, target)) {
      settledRef.current = true
      setConfirmed(target.letters.map((_, i) => i))
      setWrong([])
      speak(PRAISE, { rate: 0.85, pitch: 1.4 })
      // Handed over immediately: the quiz already pauses before advancing, and
      // stacking a second delay here made a build question take 2.4s to move on
      // where a choice question takes 1.2s. The green stays up for that pause.
      onSolved()
      return
    }

    const wrongSlots = placed
      .map((tile, i) => (tile!.letter === target.letters[i] ? -1 : i))
      .filter((i) => i >= 0)
    const correctSlots = placed
      .map((_, i) => i)
      .filter((i) => !wrongSlots.includes(i))
    setWrong(wrongSlots)
    setConfirmed(correctSlots)
    speak(RETRY, { rate: 0.8, pitch: 1.1 })

    // Show the red for a moment, then hand the wrong letters back.
    timerRef.current = window.setTimeout(() => {
      setPlaced((prev) => prev.map((t, i) => (wrongSlots.includes(i) ? null : t)))
      setWrong([])
    }, 1300)
  }, [placed, target, speak, onSolved])

  // ---- dragging ------------------------------------------------------------
  // Registered once. Nothing here depends on React state, so no pointer event
  // can arrive in a window where no listener is attached - which is what left
  // the tile hovering.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      applyDrag({ ...d, x: e.clientX, y: e.clientY, over: slotAt(e.clientX, e.clientY) })
    }
    const onUp = (e: PointerEvent) => endDrag(e.clientX, e.clientY, false)
    const onCancel = (e: PointerEvent) => endDrag(e.clientX, e.clientY, true)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [endDrag])

  const beginDrag = (e: React.PointerEvent, tile: BankTile, from: number | 'bank') => {
    if (disabled || settledRef.current) return
    startRef.current = { x: e.clientX, y: e.clientY, tile, from }
    draggingRef.current = false
    // Capture so the moves keep coming to this element even when the finger
    // leaves it - otherwise the drag never crosses its threshold if the child
    // swipes off the tile immediately.
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // capture is unavailable; the window listeners still cover the gesture
    }
  }

  const moveDrag = (e: React.PointerEvent) => {
    const start = startRef.current
    if (!start || draggingRef.current) return
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < DRAG_THRESHOLD_PX) return
    draggingRef.current = true
    applyDrag({ tile: start.tile, from: start.from, x: e.clientX, y: e.clientY, over: null })
  }

  const onTileClick = (tile: BankTile, from: number | 'bank') => {
    if (suppressClickRef.current || disabled) return
    placeInFirstEmpty(tile, from)
  }

  const slotState = (i: number) => {
    if (wrong.includes(i)) return 'wrong'
    if (confirmed.includes(i)) return 'correct'
    return 'idle'
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-3" dir="rtl">
      {/* the boxes */}
      <ul role="list" className="flex flex-wrap items-center justify-center gap-1.5">
        {target.letters.map((_, i) => {
          const tile = placed[i]
          const state = slotState(i)
          const cls =
            state === 'correct'
              ? 'border-bubbly-green-500 bg-bubbly-green-100 text-bubbly-green-700'
              : state === 'wrong'
                ? 'border-bubbly-red-500 bg-bubbly-red-100 text-bubbly-red-700'
                : tile
                  ? 'border-black/15 bg-white text-ink shadow-card'
                  : 'border-dashed border-black/25 bg-white/60 text-transparent'
          return (
            <li key={i}>
              <button
                type="button"
                data-slot={i}
                onClick={() => tile && state === 'idle' && sendBack(i)}
                onPointerDown={(e) => tile && beginDrag(e, tile, i)}
                onPointerMove={moveDrag}
                onPointerUp={(e) => endDrag(e.clientX, e.clientY, false)}
                onPointerCancel={(e) => endDrag(e.clientX, e.clientY, true)}
                disabled={disabled || state !== 'idle'}
                aria-label={
                  tile
                    ? `מָקוֹם ${i + 1}, הָאוֹת ${tile.letter}`
                    : `מָקוֹם ${i + 1}, רֵיק`
                }
                className={[
                  'flex select-none touch-none items-center justify-center',
                  'rounded-xl border-4 text-2xl font-bold leading-none sm:text-3xl',
                  'transition-transform duration-150 ease-out',
                  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
                  'motion-reduce:transition-none',
                  SLOT_SIZE,
                  cls,
                  drag?.over === i ? 'scale-110 border-solid border-bubbly-indigo-500' : '',
                ].join(' ')}
              >
                {tile?.letter ?? ''}
              </button>
            </li>
          )
        })}
      </ul>

      {/* the letter bank */}
      <ul
        role="list"
        className="flex min-h-[3.5rem] flex-wrap items-center justify-center gap-1.5"
      >
        {bankTiles.map((tile) => (
          <li key={tile.id}>
            <button
              type="button"
              onClick={() => onTileClick(tile, 'bank')}
              onPointerDown={(e) => beginDrag(e, tile, 'bank')}
              onPointerMove={moveDrag}
              onPointerUp={(e) => endDrag(e.clientX, e.clientY, false)}
              onPointerCancel={(e) => endDrag(e.clientX, e.clientY, true)}
              disabled={disabled}
              aria-label={`הָאוֹת ${tile.letter}`}
              className={[
                'flex select-none touch-none items-center justify-center',
                'rounded-xl border-2 border-black/15 bg-white',
                'text-2xl font-bold leading-none text-ink shadow-card sm:text-3xl',
                'transition-transform duration-150 ease-out active:scale-95',
                'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
                'motion-reduce:transition-none',
                drag?.tile.id === tile.id ? 'opacity-30' : '',
                TILE_SIZE,
              ].join(' ')}
            >
              {tile.letter}
            </button>
          </li>
        ))}
      </ul>

      {/* the tile following the finger */}
      {drag && (
        <span
          aria-hidden="true"
          style={{ left: drag.x, top: drag.y }}
          className="pointer-events-none fixed z-50 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border-2 border-bubbly-indigo-500 bg-white text-2xl font-bold text-ink shadow-lg"
        >
          {drag.tile.letter}
        </span>
      )}
    </div>
  )
}
