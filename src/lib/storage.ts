export type Tab = 'learn' | 'numbers' | 'math' | 'quiz' | 'trace' | 'memory'

export type PersistedState = {
  soundEnabled: boolean
  bestQuizScore: number
  lastTab: Tab
}

/**
 * Same key the pre-migration app used, so an existing user's sound preference
 * and best quiz score survive the upgrade.
 */
export const STORAGE_KEY = 'learn-hebrew-app-state'

export const defaultState: PersistedState = {
  soundEnabled: true,
  bestQuizScore: 0,
  lastTab: 'learn',
}

const TABS: Tab[] = ['learn', 'numbers', 'math', 'quiz', 'trace', 'memory']

/**
 * localStorage is untrusted input: it can hold a half-written value from an
 * older version, or be unavailable entirely (Safari private mode throws).
 * Every field is validated rather than spread blindly.
 */
export function loadState(): PersistedState {
  if (typeof localStorage === 'undefined') return defaultState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return defaultState
    const p = parsed as Partial<Record<keyof PersistedState, unknown>>
    return {
      soundEnabled:
        typeof p.soundEnabled === 'boolean'
          ? p.soundEnabled
          : defaultState.soundEnabled,
      bestQuizScore:
        typeof p.bestQuizScore === 'number' && Number.isFinite(p.bestQuizScore)
          ? p.bestQuizScore
          : defaultState.bestQuizScore,
      lastTab:
        typeof p.lastTab === 'string' && TABS.includes(p.lastTab as Tab)
          ? (p.lastTab as Tab)
          : defaultState.lastTab,
    }
  } catch (err) {
    console.warn('Could not load saved state; using defaults.', err)
    return defaultState
  }
}

export function saveState(state: PersistedState): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    // Private mode or quota. Losing a preference is not worth breaking the app.
    console.warn('Could not save state.', err)
  }
}

// ------------------------------------------------------------- quiz session

/**
 * The in-progress round, kept apart from the preference state above because it
 * is a large object written on a different cadence and must be discardable
 * without touching a child's settings.
 */
export const QUIZ_STORAGE_KEY = 'learn-hebrew-quiz-session'

/** Raw, unvalidated. Parsing and shape checking happen in lib/quiz.ts. */
export function loadQuizRaw(): unknown {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(QUIZ_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.warn('Could not read the saved quiz.', err)
    return null
  }
}

export function saveQuiz(session: unknown): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(session))
  } catch (err) {
    // Quota or private mode. Losing a saved round is not worth breaking the app.
    console.warn('Could not save the quiz.', err)
  }
}

export function clearQuiz(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(QUIZ_STORAGE_KEY)
  } catch (err) {
    console.warn('Could not clear the saved quiz.', err)
  }
}
