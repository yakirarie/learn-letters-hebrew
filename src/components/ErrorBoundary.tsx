import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Catches a render-time throw and shows something readable.
 *
 * Without this a failure anywhere in the tree left the child looking at a blank
 * screen with no indication of what happened, which is both a bad experience and
 * impossible to diagnose from the outside. The message is deliberately plain and
 * includes the error text, so a parent can report it.
 *
 * A class component because React has no hook equivalent - there is no
 * `useErrorBoundary`.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('The app hit an error while rendering.', error, info)
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div
        dir="rtl"
        className="flex h-full min-h-0 flex-col items-center justify-center gap-4 bg-cream px-6 text-center"
      >
        <span className="text-6xl" aria-hidden="true">
          🛠️
        </span>
        <p className="text-xl font-bold text-ink">מַשֶּׁהוּ הִשְׁתַּבֵּשׁ</p>
        <p className="text-base text-ink/70">
          נַסּוּ לְרַעֲנֵן אֶת הָעַמּוּד. אִם זֶה חוֹזֵר, כַּתְּבוּ אֶת הַהוֹדָעָה
          שֶׁלְּמַטָּה.
        </p>
        <pre
          dir="ltr"
          className="max-h-40 w-full max-w-md overflow-auto rounded-2xl bg-white p-3 text-start text-xs text-ink shadow-card"
        >
          {error.message}
        </pre>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-[64px] select-none touch-manipulation rounded-2xl bg-bubbly-indigo-500 px-6 py-3 text-lg font-bold text-white shadow-card transition-transform duration-150 active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"
        >
          🔄 רַעֲנֵן
        </button>
      </div>
    )
  }
}
