import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  isFinished,
  newSession,
  outOfStrikes,
  parseSession,
  ranOutOfTime,
  type QuizSession,
  type QuizSettings,
} from '../lib/quiz'
import { clearQuiz, loadQuizRaw, saveQuiz } from '../lib/storage'

/** A saved round is only worth offering if it can still be played. */
function isPlayable(s: QuizSession | null): s is QuizSession {
  return !!s && !isFinished(s) && !outOfStrikes(s) && !ranOutOfTime(s)
}

type QuizContextValue = {
  /** The round on screen, or null when the setup screen should be showing. */
  session: QuizSession | null
  /**
   * A saved, unfinished round. Offered as "resume" rather than entered
   * automatically: dropping a child straight back into a quiz when they open
   * the app is disorienting, and they should get to choose.
   */
  parked: QuizSession | null
  start: (settings: QuizSettings) => void
  /** Pick up the parked round exactly where it stopped. */
  resume: () => void
  /** Abandon the round. Clears the save, so this is a deliberate end. */
  quit: () => void
  /** Leave a finished round and return to the setup screen. */
  finish: () => void
  recordAnswer: (correct: boolean) => void
  advance: () => void
  /** Add time spent with the quiz visible. */
  addElapsed: (ms: number) => void
}

const QuizContext = createContext<QuizContextValue | null>(null)

export function QuizSessionProvider({ children }: { children: ReactNode }) {
  // Always open on setup. The saved round is parked, not entered.
  const [session, setSession] = useState<QuizSession | null>(null)
  const [parked, setParked] = useState<QuizSession | null>(() => {
    const restored = parseSession(loadQuizRaw())
    return isPlayable(restored) ? restored : null
  })

  useEffect(() => {
    // Rewritten as it changes so a refresh resumes from the current question.
    if (session) saveQuiz(session)
  }, [session])

  const start = useCallback((settings: QuizSettings) => {
    const next = newSession(settings)
    saveQuiz(next)
    setParked(null)
    setSession(next)
  }, [])

  const resume = useCallback(() => {
    const restored = parseSession(loadQuizRaw())
    if (!isPlayable(restored)) return
    setParked(null)
    setSession(restored)
  }, [])

  const quit = useCallback(() => {
    clearQuiz()
    setSession(null)
    setParked(null)
  }, [])

  const finish = useCallback(() => {
    clearQuiz()
    setSession(null)
    setParked(null)
  }, [])

  const recordAnswer = useCallback((correct: boolean) => {
    setSession((s) => {
      if (!s) return s
      return {
        ...s,
        score: correct ? s.score + 1 : s.score,
        strikes: correct ? s.strikes : s.strikes + 1,
      }
    })
  }, [])

  const advance = useCallback(() => {
    setSession((s) => (s ? { ...s, index: s.index + 1 } : s))
  }, [])

  const addElapsed = useCallback((ms: number) => {
    setSession((s) => {
      if (!s || isFinished(s)) return s
      return { ...s, elapsedMs: s.elapsedMs + ms }
    })
  }, [])

  /**
   * The clock runs only when a limit is set and the round is unfinished, and
   * only while the app is visible - a timer that keeps counting while the child
   * is away is the same unfairness as a wall-clock deadline.
   *
   * Depends on a boolean rather than on `session`, or every tick would tear the
   * interval down and rebuild it.
   */
  const ticking =
    !!session && !isFinished(session) && session.settings.timeLimitSec !== null
  useEffect(() => {
    if (!ticking) return
    let last = Date.now()
    const id = window.setInterval(() => {
      const now = Date.now()
      const delta = now - last
      last = now
      if (document.visibilityState === 'visible') addElapsed(delta)
    }, 1000)
    return () => window.clearInterval(id)
  }, [ticking, addElapsed])

  const value = useMemo<QuizContextValue>(
    () => ({
      session,
      parked,
      start,
      resume,
      quit,
      finish,
      recordAnswer,
      advance,
      addElapsed,
    }),
    [session, parked, start, resume, quit, finish, recordAnswer, advance, addElapsed],
  )

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext)
  if (!ctx) throw new Error('useQuiz must be used inside <QuizSessionProvider>')
  return ctx
}
