/**
 * Static palette map.
 *
 * This exists as data rather than string interpolation on purpose: Tailwind
 * scans source text for literal class names, so `bg-bubbly-${key}-100` would be
 * purged from the production build. Every class below appears verbatim.
 *
 * `as const` makes the keys a union, so `palette: 'chartreuse'` fails typecheck.
 *
 * Four roles, each with a measured contrast job:
 *   soft  - the card tint (100)
 *   deep  - the glyph on that tint (700); every hue clears the 3:1 large-text
 *           floor, worst case coral at 4.05:1
 *   solid - accents, rings and progress fills (500); never used behind white
 *           text, because white-on-500 fails for 8 of the 14 hues
 *   edge  - borders around a `soft` surface, so a card reads as vibrant
 *           without the glyph losing contrast
 *   ring  - focus / selection outlines
 */
export const palette = {
  red: {
    soft: 'bg-bubbly-red-100',
    deep: 'text-bubbly-red-700',
    solid: 'bg-bubbly-red-500',
    ring: 'ring-bubbly-red-500',
    edge: 'border-bubbly-red-500',
  },
  coral: {
    soft: 'bg-bubbly-coral-100',
    deep: 'text-bubbly-coral-700',
    solid: 'bg-bubbly-coral-500',
    ring: 'ring-bubbly-coral-500',
    edge: 'border-bubbly-coral-500',
  },
  orange: {
    soft: 'bg-bubbly-orange-100',
    deep: 'text-bubbly-orange-700',
    solid: 'bg-bubbly-orange-500',
    ring: 'ring-bubbly-orange-500',
    edge: 'border-bubbly-orange-500',
  },
  gold: {
    soft: 'bg-bubbly-gold-100',
    deep: 'text-bubbly-gold-700',
    solid: 'bg-bubbly-gold-500',
    ring: 'ring-bubbly-gold-500',
    edge: 'border-bubbly-gold-500',
  },
  yellow: {
    soft: 'bg-bubbly-yellow-100',
    deep: 'text-bubbly-yellow-700',
    solid: 'bg-bubbly-yellow-500',
    ring: 'ring-bubbly-yellow-500',
    edge: 'border-bubbly-yellow-500',
  },
  green: {
    soft: 'bg-bubbly-green-100',
    deep: 'text-bubbly-green-700',
    solid: 'bg-bubbly-green-500',
    ring: 'ring-bubbly-green-500',
    edge: 'border-bubbly-green-500',
  },
  teal: {
    soft: 'bg-bubbly-teal-100',
    deep: 'text-bubbly-teal-700',
    solid: 'bg-bubbly-teal-500',
    ring: 'ring-bubbly-teal-500',
    edge: 'border-bubbly-teal-500',
  },
  cyan: {
    soft: 'bg-bubbly-cyan-100',
    deep: 'text-bubbly-cyan-700',
    solid: 'bg-bubbly-cyan-500',
    ring: 'ring-bubbly-cyan-500',
    edge: 'border-bubbly-cyan-500',
  },
  blue: {
    soft: 'bg-bubbly-blue-100',
    deep: 'text-bubbly-blue-700',
    solid: 'bg-bubbly-blue-500',
    ring: 'ring-bubbly-blue-500',
    edge: 'border-bubbly-blue-500',
  },
  indigo: {
    soft: 'bg-bubbly-indigo-100',
    deep: 'text-bubbly-indigo-700',
    solid: 'bg-bubbly-indigo-500',
    ring: 'ring-bubbly-indigo-500',
    edge: 'border-bubbly-indigo-500',
  },
  purple: {
    soft: 'bg-bubbly-purple-100',
    deep: 'text-bubbly-purple-700',
    solid: 'bg-bubbly-purple-500',
    ring: 'ring-bubbly-purple-500',
    edge: 'border-bubbly-purple-500',
  },
  pink: {
    soft: 'bg-bubbly-pink-100',
    deep: 'text-bubbly-pink-700',
    solid: 'bg-bubbly-pink-500',
    ring: 'ring-bubbly-pink-500',
    edge: 'border-bubbly-pink-500',
  },
  brown: {
    soft: 'bg-bubbly-brown-100',
    deep: 'text-bubbly-brown-700',
    solid: 'bg-bubbly-brown-500',
    ring: 'ring-bubbly-brown-500',
    edge: 'border-bubbly-brown-500',
  },
  slate: {
    soft: 'bg-bubbly-slate-100',
    deep: 'text-bubbly-slate-700',
    solid: 'bg-bubbly-slate-500',
    ring: 'ring-bubbly-slate-500',
    edge: 'border-bubbly-slate-500',
  },
} as const;

export type PaletteKey = keyof typeof palette
