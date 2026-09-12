import { BackIcon, SpeakerIcon, SpeakerOffIcon } from './icons'

type Props = {
  title: string
  soundEnabled: boolean
  onToggleSound: () => void
  /** Shown only when a sub-view (e.g. a single letter) is open. */
  onBack?: () => void
}

const ICON_BUTTON = [
  'inline-flex h-14 w-14 min-h-[56px] min-w-[56px] shrink-0 select-none touch-manipulation',
  'items-center justify-center rounded-2xl border-2 border-black/10 bg-white',
  'text-ink shadow-card',
  'transition-transform duration-150 ease-out',
  'active:scale-95',
  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-ink',
  'motion-reduce:transition-none',
].join(' ')

export function AppHeader({
  title,
  soundEnabled,
  onToggleSound,
  onBack,
}: Props) {
  return (
    <header
      className="shrink-0 px-3 pb-2"
      style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}
    >
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="חֲזָרָה לְטַבְלַת הָאוֹתִיּוֹת"
            className={ICON_BUTTON}
          >
            <BackIcon className="h-7 w-7" />
          </button>
        )}

        <h1 className="min-w-0 flex-1 truncate text-center text-xl font-bold text-ink sm:text-2xl">
          {title}
        </h1>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'כַּבֵּה קוֹל' : 'הַדְלֵק קוֹל'}
          aria-pressed={soundEnabled}
          className={ICON_BUTTON}
        >
          {soundEnabled ? (
            <SpeakerIcon className="h-7 w-7" />
          ) : (
            <SpeakerOffIcon className="h-7 w-7" />
          )}
        </button>
      </div>
    </header>
  )
}
