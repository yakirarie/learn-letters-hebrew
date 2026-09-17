import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loadState, saveState, type PersistedState, type Tab } from '../lib/storage'
import { speak as speakRaw, type SpeakOptions } from '../lib/speech'

export type AppState = {
  soundEnabled: boolean
  toggleSound: () => void
  bestQuizScore: number
  recordQuizScore: (score: number) => void
  tab: Tab
  setTab: (tab: Tab) => void
  /**
   * `null` means the letter grid (the hub). A number means the full-screen
   * practice view for that letter. Session-only: the app always opens on the
   * grid, matching the pre-migration "always start from the beginning".
   */
  letterIndex: number | null
  openLetter: (index: number) => void
  closeLetter: () => void
  /**
   * Speaks Hebrew text, honouring the sound toggle. Callers never need to
   * check `soundEnabled` themselves.
   */
  speak: (text: string, options?: SpeakOptions) => void
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState)
  const [letterIndex, setLetterIndex] = useState<number | null>(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  // Keeps the stored object identity stable when the tab has not changed, so a
  // same-tab tap does not trigger a needless localStorage write.
  const setTab = useCallback((tab: Tab) => {
    setState((s) => (s.lastTab === tab ? s : { ...s, lastTab: tab }))
    setLetterIndex(null)
  }, [])

  const toggleSound = useCallback(() => {
    setState((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
  }, [])

  const recordQuizScore = useCallback((score: number) => {
    setState((s) =>
      score > s.bestQuizScore ? { ...s, bestQuizScore: score } : s,
    )
  }, [])

  const openLetter = useCallback((index: number) => setLetterIndex(index), [])
  const closeLetter = useCallback(() => setLetterIndex(null), [])

  const { soundEnabled } = state
  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!soundEnabled) return
      speakRaw(text, options)
    },
    [soundEnabled],
  )

  const value = useMemo<AppState>(
    () => ({
      soundEnabled,
      toggleSound,
      bestQuizScore: state.bestQuizScore,
      recordQuizScore,
      tab: state.lastTab,
      setTab,
      letterIndex,
      openLetter,
      closeLetter,
      speak,
    }),
    [
      soundEnabled,
      toggleSound,
      state.bestQuizScore,
      recordQuizScore,
      state.lastTab,
      setTab,
      letterIndex,
      openLetter,
      closeLetter,
      speak,
    ],
  )

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  )
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext)
  if (!ctx) {
    throw new Error('useAppState must be used inside <AppStateProvider>')
  }
  return ctx
}
