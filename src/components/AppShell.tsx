import type { ReactNode } from 'react'

/**
 * The app frame.
 *
 * Height comes from `.app-shell` in index.css (`100svh`, with a `100vh`
 * fallback) rather than a utility class here, because the fallback needs two
 * declarations and a utility cannot express that cascade.
 *
 * It is the small viewport height, deliberately: `100dvh` grows when a phone's
 * URL bar hides while the ancestors' `height: 100%` resolves against the small
 * viewport, so the shell outgrew its container, the document scrolled, and the
 * tab bar ended up off-screen.
 *
 * `min-h-0` on <main> is load-bearing - a flex child defaults to
 * `min-height: auto` and refuses to shrink below its content, which pushes the
 * overflow to the page and produces exactly the stray scrollbar we are avoiding.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell flex flex-col overflow-hidden bg-cream text-ink">
      {children}
    </div>
  )
}
