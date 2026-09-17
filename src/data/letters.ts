import type { PaletteKey } from '../lib/palette'

export type LetterExample = {
  /** The word as displayed and spoken, with nikud. */
  word: string
  /** Emoji used as the illustration. */
  pic: string
}

export type LetterDatum = {
  /** The letter glyph, without nikud. */
  l: string
  /**
   * The letter's full name, spoken instead of the bare glyph.
   *
   * Only the five final forms carry one: "מֵם סוֹפִית" rather than "ם", so the
   * name itself says which form it is. A plain letter has no entry and its glyph
   * is spoken, as before.
   */
  name?: string
  palette: PaletteKey
  examples: LetterExample[]
}

/** What to say for a letter: its full name if it has one, otherwise its glyph. */
export function spokenName(letter: LetterDatum): string {
  return letter.name ?? letter.l
}

/**
 * The 22 letters of the Hebrew alphabet.
 * Ported verbatim from the pre-migration index.html; only `color` (a raw hex)
 * became `palette` (a key into src/lib/palette.ts).
 */
export const letters: LetterDatum[] = [
  {
    l: "א",
    palette: 'red',
    examples: [
      { word: "אַרְנָב", pic: "🐰" },
      { word: "אַרְיֵה", pic: "🦁" },
      { word: "אֲבַטִּיחַ", pic: "🍉" },
      { word: "אוֹטוֹ", pic: "🚗" },
    ],
  },
  {
    l: "ב",
    palette: 'blue',
    examples: [
      { word: "בַּיִת", pic: "🏠" },
      { word: "בַּלּוֹן", pic: "🎈" },
      { word: "בַּנָּנָה", pic: "🍌" },
      { word: "בּוּבָּה", pic: "🪆" },
    ],
  },
  {
    l: "ג",
    palette: 'orange',
    examples: [
      { word: "גָּמָל", pic: "🐪" },
      { word: "גֶּשֶׁר", pic: "🌉" },
      { word: "גֶּזֶר", pic: "🥕" },
      { word: "גְּלִידָה", pic: "🍦" },
    ],
  },
  {
    l: "ד",
    palette: 'cyan',
    examples: [
      { word: "דָּג", pic: "🐟" },
      { word: "דֹּב", pic: "🐻" },
      { word: "דֶּלֶת", pic: "🚪" },
      { word: "דְּבַשׁ", pic: "🍯" },
    ],
  },
  {
    l: "ה",
    palette: 'brown',
    examples: [
      { word: "הַר", pic: "⛰️" },
      { word: "הֲדַס", pic: "🌿" },
      { word: "הֶלִיקוֹפְּטֶר", pic: "🚁" },
    ],
  },
  {
    l: "ו",
    palette: 'pink',
    examples: [
      { word: "וֶרֶד", pic: "🌹" },
      { word: "וִילוֹן", pic: "🪟" },
      { word: "וָרֹד", pic: "🩷" },
    ],
  },
  {
    l: "ז",
    palette: 'slate',
    examples: [
      { word: "זְאֵב", pic: "🐺" },
      { word: "זַיִת", pic: "🫒" },
      { word: "זֶבְּרָה", pic: "🦓" },
      { word: "זְרוּעַ", pic: "💪" },
    ],
  },
  {
    l: "ח",
    palette: 'coral',
    examples: [
      { word: "חָתוּל", pic: "🐱" },
      { word: "חֲמוֹר", pic: "🫏" },
      { word: "חָלָב", pic: "🥛" },
      { word: "חַמָּנִיָּה", pic: "🌻" },
    ],
  },
  {
    l: "ט",
    palette: 'purple',
    examples: [
      { word: "טָלֶה", pic: "🐑" },
      { word: "טִיגְרִיס", pic: "🐯" },
      { word: "טֶלֶפוֹן", pic: "📱" },
      { word: "טַוָּס", pic: "🦚" },
    ],
  },
  {
    l: "י",
    palette: 'indigo',
    examples: [
      { word: "יָרֵחַ", pic: "🌙" },
      { word: "יָם", pic: "🌊" },
      { word: "יוֹנָה", pic: "🕊️" },
      { word: "יֶלֶד", pic: "👦" },
    ],
  },
  {
    l: "כ",
    palette: 'gold',
    examples: [
      { word: "כֶּלֶב", pic: "🐶" },
      { word: "כּוֹכָב", pic: "⭐" },
      { word: "כִּסֵּא", pic: "🪑" },
      { word: "כַּדּוּר", pic: "⚽" },
    ],
  },
  {
    l: "ל",
    palette: 'red',
    examples: [
      { word: "לֵב", pic: "❤️" },
      { word: "לִוְיָתָן", pic: "🐋" },
      { word: "לֶחֶם", pic: "🍞" },
      { word: "לִימוֹן", pic: "🍋" },
    ],
  },
  {
    l: "מ",
    palette: 'green',
    examples: [
      { word: "מָטוֹס", pic: "✈️" },
      { word: "מְכוֹנִית", pic: "🚙" },
      { word: "מִגְדָּל", pic: "🗼" },
      { word: "מְלָפְפוֹן", pic: "🥒" },
    ],
  },
  {
    l: "נ",
    palette: 'teal',
    examples: [
      { word: "נָחָשׁ", pic: "🐍" },
      { word: "נָמֵר", pic: "🐆" },
      { word: "נֵר", pic: "🕯️" },
      { word: "נֶשֶׁר", pic: "🦅" },
    ],
  },
  {
    l: "ס",
    palette: 'brown',
    examples: [
      { word: "סוּס", pic: "🐴" },
      { word: "סֵפֶר", pic: "📚" },
      { word: "סִירָה", pic: "⛵" },
      { word: "סְנָאי", pic: "🐿️" },
    ],
  },
  {
    l: "ע",
    palette: 'pink',
    examples: [
      { word: "עוּגָה", pic: "🎂" },
      { word: "עַגְבָנִיָּה", pic: "🍅" },
      { word: "עֵץ", pic: "🌳" },
      { word: "עַכְבָּר", pic: "🐭" },
    ],
  },
  {
    l: "פ",
    palette: 'purple',
    examples: [
      { word: "פַּרְפַּר", pic: "🦋" },
      { word: "פֶּרַח", pic: "🌸" },
      { word: "פִּיל", pic: "🐘" },
      { word: "פִּינְגְּוִין", pic: "🐧" },
    ],
  },
  {
    l: "צ",
    palette: 'green',
    examples: [
      { word: "צָב", pic: "🐢" },
      { word: "צְפַרְדֵּעַ", pic: "🐸" },
      { word: "צְבִי", pic: "🦌" },
      { word: "צָהֹב", pic: "💛" },
    ],
  },
  {
    l: "ק",
    palette: 'orange',
    examples: [
      { word: "קוֹף", pic: "🐒" },
      { word: "קִיפּוֹד", pic: "🦔" },
      { word: "קֶשֶׁת", pic: "🌈" },
      { word: "קַרְנָף", pic: "🦏" },
    ],
  },
  {
    l: "ר",
    palette: 'red',
    examples: [
      { word: "רַכֶּבֶת", pic: "🚂" },
      { word: "רוֹבּוֹט", pic: "🤖" },
      { word: "רוּחַ", pic: "💨" },
      { word: "רִיקּוּד", pic: "💃" },
    ],
  },
  {
    l: "ש",
    palette: 'yellow',
    examples: [
      { word: "שֶׁמֶשׁ", pic: "☀️" },
      { word: "שָׁפָן", pic: "🐇" },
      { word: "שׁוֹקוֹלָד", pic: "🍫" },
      { word: "שׁוּעָל", pic: "🦊" },
    ],
  },
  {
    l: "ת",
    palette: 'red',
    examples: [
      { word: "תּוּת", pic: "🍓" },
      { word: "תַּרְנְגוֹל", pic: "🐓" },
      { word: "תַּפּוּחַ", pic: "🍎" },
      { word: "תַּנִּין", pic: "🐊" },
    ],
  },
]

/**
 * The five letters that change shape at the end of a word - kaf, mem, nun, pe
 * and tsadi - as entries in their own right.
 *
 * Ordered by where their base letters appear above, so the alphabet reads
 * ... ת, then ך ם ן ף ץ.
 *
 * Each inherits its base letter's palette deliberately: they are the same
 * letters in a different position, and inventing five new hues would suggest
 * five unrelated letters.
 *
 * Kept out of the quiz and the memory game on purpose - every word here ENDS
 * with its letter, so "which letter does this word start with?" would be false
 * if one of these were ever an answer.
 */
export const finalLetters: LetterDatum[] = [
  {
    l: "ך",
    palette: 'gold',
    name: "כַּף סוֹפִית",
    examples: [
      { word: "מֶלֶךְ", pic: "👑" },
      { word: "דֶּרֶךְ", pic: "🛣️" },
    ],
  },
  {
    l: "ם",
    palette: 'green',
    name: "מֵם סוֹפִית",
    examples: [
      { word: "עוֹלָם", pic: "🌍" },
      { word: "מַיִם", pic: "💧" },
    ],
  },
  {
    l: "ן",
    palette: 'teal',
    name: "נוּן סוֹפִית",
    examples: [
      { word: "עָנָן", pic: "☁️" },
      { word: "אֶבֶן", pic: "🪨" },
    ],
  },
  {
    l: "ף",
    palette: 'purple',
    name: "פֵּא סוֹפִית",
    examples: [
      { word: "כֶּסֶף", pic: "🪙" },
      { word: "חוֹף", pic: "🏖️" },
    ],
  },
  {
    l: "ץ",
    palette: 'green',
    name: "צָדִי סוֹפִית",
    examples: [
      { word: "אֶרֶץ", pic: "🗺️" },
      { word: "עֵץ", pic: "🌳" },
    ],
  },
]

/**
 * What the letters grid and the tracing letters mode show: the 22 letters
 * followed by the five final forms.
 */
export const gridLetters: LetterDatum[] = [...letters, ...finalLetters]
