import { finalLetters, letters, type LetterDatum } from '../data/letters'

/** Hebrew points and accents — nikud. These are not letters a child writes. */
const MARKS = /[\u0591-\u05C7]/g

/**
 * Longest word the word-build game will present.
 *
 * The example words run up to eight letters (הֶלִיקוֹפְּטֶר). At 5 the boxes are
 * ~60px on a 360px phone; at 6 they drop toward 50px and at 8 they are below the
 * touch floor and illegible. 88 of the 96 words are within this, 86 of them
 * unique, which is ample for a six-question round.
 */
export const MAX_WORD_LETTERS = 5

/** The word as it is actually written: vowel points removed, one char per letter. */
export function stripMarks(word: string): string {
  return word.replace(MARKS, '')
}

/** The letters a child must place, in writing order. */
export function lettersOf(word: string): string[] {
  return [...stripMarks(word)]
}

export type BuildWord = {
  /** The fully pointed word, for display and speech. */
  word: string
  /** The illustration the question shows. */
  pic: string
  /** The letters to place, in order. */
  letters: string[]
}

/**
 * Every example word short enough to spell, deduplicated.
 *
 * Keyed on word + picture, not the bare word: וֶרֶד (a rose) and וָרֹד (the
 * colour pink) both strip to ורד, and they are genuinely different words. עֵץ
 * appears twice because it illustrates both ע and ץ; same word, same picture,
 * so it is dropped once.
 *
 * Finals are included on purpose. Spelling is the one place a final form
 * belongs — a child spelling מֶלֶךְ needs the ך, and the bank is built from the
 * word's own letters so the right glyph is always available.
 */
export const buildableWords: BuildWord[] = (() => {
  const seen = new Set<string>()
  const out: BuildWord[] = []
  const all: LetterDatum[] = [...letters, ...finalLetters]
  for (const letter of all) {
    for (const example of letter.examples) {
      const bare = stripMarks(example.word)
      if (bare.length < 2 || bare.length > MAX_WORD_LETTERS) continue
      const key = `${bare}|${example.pic}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ word: example.word, pic: example.pic, letters: [...bare] })
    }
  }
  return out
})()

/** A tile in the letter bank. Ids keep duplicates distinct — שֶׁמֶשׁ has two ש. */
export type BankTile = {
  id: string
  letter: string
}

/** How many letters that do not belong are mixed into the bank. */
const DISTRACTORS = 3

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * The word's own letters, shuffled, plus a few that are not in it.
 *
 * Built from the word rather than drawn from a pool, so the puzzle is always
 * solvable and a final form appears automatically when the word needs one.
 * Distractors deliberately exclude letters already in the word: a child should
 * be choosing where a letter goes, not which of two identical tiles is right.
 */
export function buildBank(
  target: BuildWord,
  pool: readonly string[],
  random: () => number = Math.random,
): BankTile[] {
  const inWord = new Set(target.letters)
  const candidates = shuffle(
    pool.filter((letter) => !inWord.has(letter)),
    random,
  ).slice(0, DISTRACTORS)

  const letters = shuffle([...target.letters, ...candidates], random)
  return letters.map((letter, i) => ({ id: `t${i}_${letter}`, letter }))
}

/** Whether every slot holds the letter that belongs there. */
export function isSpelledCorrectly(
  placed: readonly (BankTile | null)[],
  target: BuildWord,
): boolean {
  return placed.every((tile, i) => tile?.letter === target.letters[i])
}
