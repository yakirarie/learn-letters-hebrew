import { ChevronLeft, ChevronRight } from './icons'

export type NavDirection = 'prev' | 'next'

/**
 * RTL-aware navigation.
 *
 * In a right-to-left flow the alphabet starts on the right, so "previous" moves
 * right and "next" moves left. The chevron always sits on the outer edge and
 * points outward, which is how the pre-migration app's `קוֹדֵם ➡` / `⬅ הַבָּא`
 * pair read - this just replaces the emoji arrows with real SVG chevrons.
 */
const CONFIG = {
  prev: { label: 'קוֹדֵם', Icon: ChevronRight, iconFirst: true },
  next: { label: 'הַבָּא', Icon: ChevronLeft, iconFirst: false },
} as const

type Props = {
  direction: NavDirection
  onClick: () => void
  disabled?: boolean
}

export function NavButton({ direction, onClick, disabled = false }: Props) {
  const { label, Icon, iconFirst } = CONFIG[direction]

  const icon = <Icon className="h-7 w-7 shrink-0" />

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex min-h-[64px] select-none touch-manipulation items-center justify-center gap-2',
        'rounded-2xl border-2 border-black/10 bg-white px-6 py-3',
        'text-lg font-bold text-ink shadow-card',
        'transition-transform duration-150 ease-out',
        'active:scale-95',
        'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
        'disabled:pointer-events-none disabled:opacity-40',
        'motion-reduce:transition-none',
      ].join(' ')}
    >
      {iconFirst && icon}
      <span>{label}</span>
      {!iconFirst && icon}
    </button>
  )
}
