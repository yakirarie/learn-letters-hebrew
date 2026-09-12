import type { Tab } from '../lib/storage'

type TabDef = { id: Tab; emoji: string; label: string }

/**
 * Six destinations in one row rather than the pre-migration two rows of three.
 * Two stacked rows of 64px targets consumed a fifth of a small phone's height;
 * a single 64px row keeps the whole screen for content.
 */
const TABS: TabDef[] = [
  { id: 'learn', emoji: '📚', label: 'אוֹתִיּוֹת' },
  { id: 'numbers', emoji: '🔢', label: 'מִסְפָּרִים' },
  { id: 'math', emoji: '➕', label: 'חֶשְׁבּוֹן' },
  { id: 'quiz', emoji: '🎮', label: 'חִידּוֹן' },
  { id: 'trace', emoji: '✏️', label: 'כְּתִיבָה' },
  { id: 'memory', emoji: '🃏', label: 'זִכָּרוֹן' },
]

type Props = {
  active: Tab
  onChange: (tab: Tab) => void
}

export function TabBar({ active, onChange }: Props) {
  return (
    <nav
      aria-label="מָסְלוּלִים"
      className="shrink-0 border-t border-black/10 bg-white/80 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-6">
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex min-h-[64px] w-full select-none touch-manipulation flex-col',
                  'items-center justify-center gap-0.5 px-1 py-1.5',
                  'transition-colors duration-150',
                  'focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-ink',
                  isActive
                    ? 'bg-bubbly-blue-100 text-bubbly-blue-700'
                    : 'text-ink/60',
                ].join(' ')}
              >
                <span className="text-xl leading-none" aria-hidden="true">
                  {tab.emoji}
                </span>
                <span className="text-[11px] font-bold leading-tight">
                  {tab.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
