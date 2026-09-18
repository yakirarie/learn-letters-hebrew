import { AppHeader } from './components/AppHeader'
import { AppShell } from './components/AppShell'
import { TabBar } from './components/TabBar'
import type { Tab } from './lib/storage'
import { LetterGridScreen } from './screens/LetterGridScreen'
import { LetterPracticeScreen } from './screens/LetterPracticeScreen'
import { MathScreen } from './screens/MathScreen'
import { MemoryScreen } from './screens/MemoryScreen'
import { NumbersScreen } from './screens/NumbersScreen'
import { QuizScreen } from './screens/QuizScreen'
import { TraceScreen } from './screens/TraceScreen'
import { useAppState } from './state/AppStateProvider'
import { useQuiz } from './state/QuizSession'

const TITLES: Record<Tab, string> = {
  learn: 'לוֹמְדִים אוֹתִיּוֹת 📖',
  numbers: 'לוֹמְדִים מִסְפָּרִים 🔢',
  math: 'חֶשְׁבּוֹן פָּשׁוּט ➕➖',
  quiz: 'חִידּוֹן 🎯',
  trace: 'כְּתִיבָה ✏️',
  memory: 'זִכָּרוֹן 🃏',
}

export function App() {
  const {
    tab,
    setTab,
    soundEnabled,
    toggleSound,
    letterIndex,
    openLetter,
    closeLetter,
  } = useAppState()
  const { session } = useQuiz()

  // The practice view is a sub-view of the letters tab, so the header grows a
  // back button and the grid is replaced.
  const inPractice = tab === 'learn' && letterIndex !== null
  /**
   * A running quiz is a dedicated window: the tab bar is not rendered at all,
   * so the child cannot wander off mid-round. The quit button in the quiz's own
   * status row is the only exit - and because the session is saved, quitting is
   * safe rather than destructive.
   */
  const inQuiz = session !== null

  return (
    <AppShell>
      <AppHeader
        title={TITLES[tab]}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onBack={inPractice ? closeLetter : undefined}
      />

      <main className="min-h-0 flex-1 overflow-hidden short-landscape:overflow-y-auto">
        {tab === 'learn' &&
          (inPractice ? (
            <LetterPracticeScreen
              key={letterIndex}
              index={letterIndex}
              onNavigate={openLetter}
            />
          ) : (
            <LetterGridScreen />
          ))}
        {tab === 'numbers' && <NumbersScreen />}
        {tab === 'math' && <MathScreen />}
        {tab === 'quiz' && <QuizScreen />}
        {tab === 'trace' && <TraceScreen />}
        {tab === 'memory' && <MemoryScreen />}
      </main>

      {!inQuiz && <TabBar active={tab} onChange={setTab} />}
    </AppShell>
  )
}
