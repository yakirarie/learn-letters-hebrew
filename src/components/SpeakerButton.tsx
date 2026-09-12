import { SpeakerIcon } from './icons'

type Props = {
  onClick: () => void
  /** Rendered size. `lg` is the hero trigger on the practice view. */
  size?: 'md' | 'lg'
  className?: string
}

const SIZES = {
  md: 'h-16 w-16 min-h-[64px] min-w-[64px]',
  // Shrinks to `md` in landscape, where vertical room is the scarce resource.
  lg: 'h-24 w-24 min-h-[96px] min-w-[96px] short-landscape:h-16 short-landscape:w-16 short-landscape:min-h-[64px] short-landscape:min-w-[64px]',
} as const

const ICON_SIZES = {
  md: 'h-8 w-8',
  lg: 'h-12 w-12 short-landscape:h-8 short-landscape:w-8',
} as const

/**
 * The pronunciation trigger. Icon-only by design - the target audience cannot
 * read yet, so the speaker glyph carries the meaning and the Hebrew aria-label
 * carries it for assistive tech.
 */
export function SpeakerButton({ onClick, size = 'md', className = '' }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="הַשְׁמַע"
      className={[
        'inline-flex select-none touch-manipulation items-center justify-center rounded-full',
        'bg-bubbly-blue-500 text-white shadow-card',
        'transition-transform duration-150 ease-out',
        'active:scale-95',
        'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
        'motion-reduce:transition-none',
        SIZES[size],
        className,
      ].join(' ')}
    >
      <SpeakerIcon className={ICON_SIZES[size]} />
    </button>
  )
}
