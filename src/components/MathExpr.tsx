import type { ReactNode } from 'react'

/**
 * Left-to-right isolation for arithmetic.
 *
 * Without this, `3 + 4 = 7` inside a `dir="rtl"` document renders as `7 = 4 + 3`.
 * The pre-migration CSS used `unicode-bidi: embed`; `isolate` is the modern
 * equivalent and additionally stops the expression's directionality leaking out
 * to the surrounding text.
 */
export function MathExpr({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span dir="ltr" style={{ unicodeBidi: 'isolate' }} className={className}>
      {children}
    </span>
  )
}
