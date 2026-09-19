import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gridLetters, letters, spokenName } from '../data/letters'
import { numbers } from '../data/numbers'
import { palette, type PaletteKey } from '../lib/palette'
import { useAppState } from '../state/AppStateProvider'
import { NavButton } from '../components/NavButton'

type TraceMode = 'letters' | 'numbers' | 'pictures'

type TraceItem = {
  display: string
  palette: PaletteKey
  /** Instruction line, e.g. "צַיֵּר אֶת הָאוֹת: א". */
  label: string
  speech: string
}

/** Fixed internal resolution; CSS scaling is handled in pointerToCanvas. */
const CANVAS_PX = 600
const LINE_WIDTH = 11

const COLORS = [
  '#2196F3',
  '#E84040',
  '#4CAF50',
  '#FF9800',
  '#9C27B0',
  '#E91E63',
  '#00BCD4',
  '#FFD600',
  '#795548',
  '#607D8B',
  '#FF7043',
  '#222222',
]

export function TraceScreen() {
  const { speak } = useAppState()
  const [mode, setMode] = useState<TraceMode>('letters')
  const [index, setIndex] = useState(0)
  const [color, setColor] = useState(COLORS[0])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const areaRef = useRef<HTMLDivElement>(null)

  /**
   * Side length of the drawing square, in CSS pixels.
   *
   * Measured rather than expressed in CSS. Three approaches were tried and each
   * failed in a different place: `aspect-square` + `h-full` let the box stretch
   * non-square (600x600 buffer drawn into a 366x431 box), `w-full` + a `vh` cap
   * ignored the height available and spilled the canvas over the colour palette,
   * and a container query (`w-[min(100%,100cqh)]`) resolved to 0 in landscape.
   * Measuring the area and taking the smaller side is unambiguous.
   */
  const [side, setSide] = useState(0)

  useEffect(() => {
    const area = areaRef.current
    if (!area) return

    const measure = () => {
      const { width, height } = area.getBoundingClientRect()
      setSide(Math.max(0, Math.floor(Math.min(width, height))))
    }

    measure()

    // Fall back to measuring on resize where ResizeObserver is missing. It is
    // in every current browser, but this is the only modern API the app uses
    // without a guard, and it would throw on an old WebView - the kind a
    // parental-control wrapper may ship.
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(area)
    return () => observer.disconnect()
  }, [])
  // The draw handlers are bound once; reading the colour through a ref keeps
  // them from needing to be re-bound on every colour change.
  const colorRef = useRef(color)
  colorRef.current = color

  const speakRef = useRef(speak)
  speakRef.current = speak

  const items = useMemo<TraceItem[]>(() => {
    if (mode === 'letters') {
      return gridLetters.map((l) => ({
        display: l.l,
        palette: l.palette,
        label: `צַיֵּר אֶת הָאוֹת: ${spokenName(l)}`,
        speech: `צַיֵּר אֶת הָאוֹת ${spokenName(l)}`,
      }))
    }
    if (mode === 'numbers') {
      return numbers.map((n) => ({
        display: String(n.n),
        palette: n.palette,
        label: `צַיֵּר אֶת הַמִּסְפָּר: ${n.n}`,
        speech: `צַיֵּר אֶת הַמִּסְפָּר ${n.n}`,
      }))
    }
    // Unique pictures drawn from the letters' example words.
    const seen = new Map<string, TraceItem>()
    for (const l of letters) {
      for (const ex of l.examples) {
        if (!seen.has(ex.pic)) {
          seen.set(ex.pic, {
            display: ex.pic,
            palette: l.palette,
            label: `צַיֵּר אֶת הַתְּמוּנָה: ${ex.pic} (${ex.word})`,
            speech: `צַיֵּר אֶת ${ex.word}`,
          })
        }
      }
    }
    return [...seen.values()]
  }, [mode])

  const item = items[Math.min(index, items.length - 1)]

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Bind the drawing surface once. React state must not drive the canvas:
  // re-rendering mid-stroke would drop points.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctxRef.current = ctx

    canvas.width = CANVAS_PX
    canvas.height = CANVAS_PX
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    /**
     * Only one pointer may draw at a time.
     *
     * Previously `drawing`/`lastX`/`lastY` were shared and unchecked, so a
     * second finger (or a resting palm) overwrote the last point and the next
     * move from the first finger drew a long stray line from the second touch
     * point. Lifting either pointer also ended the stroke while the other was
     * still down.
     */
    let activePointer: number | null = null
    let lastX = 0
    let lastY = 0

    // CSS pixels -> canvas pixels, so the stroke lands under the finger
    // regardless of how the canvas is scaled on screen.
    const toCanvas = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height),
      }
    }

    const down = (event: PointerEvent) => {
      if (activePointer !== null) return
      event.preventDefault()
      activePointer = event.pointerId
      canvas.setPointerCapture(event.pointerId)
      const p = toCanvas(event)
      lastX = p.x
      lastY = p.y
      // A tap should leave a dot, not nothing.
      ctx.beginPath()
      ctx.arc(p.x, p.y, LINE_WIDTH / 2, 0, Math.PI * 2)
      ctx.fillStyle = colorRef.current
      ctx.fill()
    }

    const move = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return
      event.preventDefault()
      const p = toCanvas(event)
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(p.x, p.y)
      ctx.strokeStyle = colorRef.current
      ctx.lineWidth = LINE_WIDTH
      ctx.stroke()
      lastX = p.x
      lastY = p.y
    }

    const up = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return
      activePointer = null
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId)
      }
    }

    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    return () => {
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
    }
  }, [])

  const show = useCallback(
    (nextIndex: number, nextItems: TraceItem[]) => {
      const wrapped = ((nextIndex % nextItems.length) + nextItems.length) % nextItems.length
      setIndex(wrapped)
      clear()
      speakRef.current(nextItems[wrapped].speech, { rate: 0.8, pitch: 1.2 })
    },
    [clear],
  )

  const changeMode = (next: TraceMode) => {
    setMode(next)
    setIndex(0)
    clear()
  }

  const MODE_LABELS: { id: TraceMode; label: string }[] = [
    { id: 'letters', label: '📚 אוֹתִיּוֹת' },
    { id: 'numbers', label: '🔢 מִסְפָּרִים' },
    { id: 'pictures', label: '🖼️ תְּמוּנוֹת' },
  ]

  return (
    <section
      className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain px-3 short-landscape:h-auto short-landscape:min-h-full short-landscape:flex-row short-landscape:gap-3"
      dir="rtl"
    >
      {/*
        `contents` in portrait keeps these four blocks as direct children of the
        section, so the canvas can still sit between them. In landscape the
        wrapper becomes a real column and the canvas moves alongside it.
      */}
      <div className="contents short-landscape:flex short-landscape:flex-1 short-landscape:flex-col short-landscape:justify-center short-landscape:gap-2">
        <div className="order-1 flex shrink-0 flex-wrap justify-center gap-2">
          {MODE_LABELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => changeMode(m.id)}
              aria-pressed={mode === m.id}
              className={[
                'min-h-[56px] select-none touch-manipulation rounded-2xl border-2 px-2 text-[11px] font-bold',
                'transition-transform duration-150 ease-out active:scale-95',
                'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
                'motion-reduce:transition-none',
                mode === m.id
                  ? 'border-transparent bg-bubbly-blue-500 text-white'
                  : 'border-black/10 bg-white text-ink',
              ].join(' ')}
            >
              {m.label}
            </button>
          ))}
        </div>

        <p className="order-2 shrink-0 text-center text-base font-bold text-ink" aria-live="polite">
          {item.label}
        </p>

        <div className="order-4 flex shrink-0 flex-wrap justify-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`צֶבַע ${c}`}
              aria-pressed={color === c}
              style={{ backgroundColor: c }}
              className={[
                'h-11 w-11 min-h-[44px] min-w-[44px] select-none touch-manipulation rounded-full',
                'transition-transform duration-150 ease-out active:scale-95',
                'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
                'motion-reduce:transition-none',
                color === c
                  ? 'ring-4 ring-ink ring-offset-2 ring-offset-cream'
                  : 'ring-2 ring-black/10',
              ].join(' ')}
            />
          ))}
        </div>

        <div className="order-5 flex shrink-0 items-center justify-between gap-2 pb-1">
          <button
            type="button"
            onClick={clear}
            className="min-h-[56px] select-none touch-manipulation rounded-2xl border-2 border-black/10 bg-white px-5 text-base font-bold text-ink shadow-card transition-transform duration-150 active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
          >
            🗑️ נַקֵּה
          </button>
          <div className="flex gap-2">
            <NavButton direction="prev" onClick={() => show(index - 1, items)} />
            <NavButton direction="next" onClick={() => show(index + 1, items)} />
          </div>
        </div>
      </div>
      <div
        ref={areaRef}
        className="order-3 flex min-h-[10rem] min-w-0 flex-1 items-center justify-center short-landscape:order-first short-landscape:min-h-0"
      >
        {/*
          The square's side is measured, not expressed in CSS - see `side`
          above. It previously used `w-full` with a vh cap, which ignored the
          height actually available and spilled the canvas over the colour
          palette (79px of overlap at 360 wide, 121px at 320, once the mode row
          grew to two lines).

          In landscape this area becomes its own column beside the controls
          (`order-first` puts it on the right in RTL, matching the letters,
          numbers and maths screens), so it gets the full viewport height rather
          than the leftover after a stacked column.
        */}
        <div className="relative aspect-square" style={{ width: side, height: side }}>
          <div
            className={`pointer-events-none absolute inset-0 flex select-none items-center justify-center font-bold leading-none opacity-10 ${palette[item.palette].deep} text-[clamp(6rem,42vmin,16rem)]`}
            aria-hidden="true"
          >
            {item.display}
          </div>
          <canvas
            ref={canvasRef}
            aria-label={`לּוּחַ צִיּוּר לְ${item.display}`}
            className="h-full w-full touch-none rounded-2xl border-4 border-dashed border-black/15 bg-white/70"
          />
        </div>
      </div>
    </section>
  )
}
