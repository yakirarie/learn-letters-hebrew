import type { ReactNode } from 'react'

/**
 * The app frame.
 *
 * `h-[100dvh]` rather than `h-screen`: on mobile Safari and Chrome `100vh` is
 * the *URL-bar-hidden* height, so `h-screen overflow-hidden` clips the footer
 * whenever the address bar is visible. `dvh` tracks the real viewport.
 *
 * `min-h-0` on <main> is load-bearing - a flex child defaults to
 * `min-height: auto` and refuses to shrink below its content, which pushes the
 * overflow to the page and produces exactly the stray scrollbar we are avoiding.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-cream text-ink">
      {children}
    </div>
  )
}
