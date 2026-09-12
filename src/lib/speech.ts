/**
 * Hebrew text-to-speech, via the Web Speech API.
 *
 * There are no audio files in this project - pronunciation is entirely
 * speech synthesis. That means output depends on the device having a Hebrew
 * (he-IL) voice installed; on a device without one the utterance is silently
 * skipped by the browser. This was true before the redesign and is unchanged.
 */

export type SpeakOptions = {
  /** 0.1 - 10. Defaults match the pre-migration app (slow and high, for kids). */
  rate?: number
  pitch?: number
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(
  text: string,
  { rate = 0.8, pitch = 1.2 }: SpeakOptions = {},
): void {
  if (!isSpeechSupported()) return
  // Cancel first: rapid tapping on a grid of letters would otherwise queue
  // utterances and read the whole alphabet back.
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'he-IL'
  utterance.rate = rate
  utterance.pitch = pitch
  utterance.volume = 1
  window.speechSynthesis.speak(utterance)
}
