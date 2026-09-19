/**
 * Quiz sound effects, synthesised with the Web Audio API.
 *
 * Deliberately not audio files. Synthesised tones carry no licence, add nothing
 * to the bundle, work offline without the service worker precaching them, and
 * are the right size for a few seconds of feedback. They also cannot go stale,
 * which a set of downloaded clips would.
 *
 * Every call takes `enabled`, so the app's sound toggle governs these exactly as
 * it governs speech.
 */

let context: AudioContext | null = null

function audio(enabled: boolean): AudioContext | null {
  if (!enabled) return null
  if (typeof window === 'undefined') return null
  try {
    if (!context) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) return null
      context = new Ctor()
    }
    // Browsers start the context suspended until a gesture; the summary only
    // ever appears after taps, so resuming here is safe.
    if (context.state === 'suspended') void context.resume()
    return context
  } catch {
    return null
  }
}

type Tone = {
  freq: number
  /** Seconds from the start of the effect. */
  at: number
  duration: number
  gain?: number
  type?: OscillatorType
}

function play(enabled: boolean, tones: Tone[]): void {
  const ctx = audio(enabled)
  if (!ctx) return
  const now = ctx.currentTime
  for (const tone of tones) {
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = tone.type ?? 'sine'
    osc.frequency.value = tone.freq
    const peak = tone.gain ?? 0.2
    const start = now + tone.at
    // A short attack and an exponential tail: a bare gate sounds like a click.
    env.gain.setValueAtTime(0.0001, start)
    env.gain.exponentialRampToValueAtTime(peak, start + 0.015)
    env.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration)
    osc.connect(env).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + tone.duration + 0.05)
  }
}

/** Time ran out: a two-strike alarm bell. */
export function playTimeUp(enabled: boolean): void {
  play(enabled, [
    { freq: 1568, at: 0, duration: 0.5, gain: 0.18, type: 'triangle' },
    { freq: 1046, at: 0, duration: 0.5, gain: 0.1, type: 'sine' },
    { freq: 1568, at: 0.62, duration: 0.5, gain: 0.18, type: 'triangle' },
    { freq: 1046, at: 0.62, duration: 0.5, gain: 0.1, type: 'sine' },
  ])
}

/** Out of strikes: a soft descending sigh, not a buzzer. A child has just lost. */
export function playOutOfStrikes(enabled: boolean): void {
  play(enabled, [
    { freq: 392, at: 0, duration: 0.45, gain: 0.16, type: 'sine' },
    { freq: 311, at: 0.22, duration: 0.45, gain: 0.16, type: 'sine' },
    { freq: 233, at: 0.44, duration: 0.7, gain: 0.15, type: 'sine' },
  ])
}

/** Finished the round: a bright rising fanfare. */
export function playFanfare(enabled: boolean): void {
  const notes = [523.25, 659.25, 783.99, 1046.5]
  play(
    enabled,
    notes.map((freq, i) => ({
      freq,
      at: i * 0.11,
      duration: i === notes.length - 1 ? 0.9 : 0.35,
      gain: 0.16,
      type: 'triangle' as OscillatorType,
    })),
  )
}
