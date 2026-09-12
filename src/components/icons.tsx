/**
 * Inline SVG icons.
 *
 * Hand-rolled rather than pulling in an icon library: the app needs six glyphs,
 * and every one is decorative (each button carries a Hebrew aria-label), so
 * `aria-hidden` is set here once instead of at every call site.
 */
import type { SVGProps } from 'react'

type IconProps = {
  className?: string
}

/**
 * Annotated rather than inferred: without the type annotation `focusable`
 * widens to `string` and stops satisfying SVGProps' Booleanish union.
 */
const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
}

export function ChevronRight({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function ChevronLeft({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export function SpeakerIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

export function SpeakerOffIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="m16 9 6 6" />
      <path d="m22 9-6 6" />
    </svg>
  )
}

/** Points toward the start of an RTL flow - "back to the hub". */
export function BackIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  )
}
