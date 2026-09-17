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
  palette: PaletteKey
  examples: LetterExample[]
  /**
   * Only the five letters that take a different shape at the end of a word:
   * kaf, mem, nun, pe, tsadi.
   *
   * These are the SAME letters, not five extra ones, so they are deliberately
   * not separate entries in `letters`. Final-form words live in their own field
   * rather than in `examples` because the quiz builds "which letter does this
   * word start with?" from `examples`, and no example emoji is currently shared
   * between two letters - that is what keeps those questions unambiguous.
   */
  final?: {
    /** The glyph used when this letter ends a word. */
    form: string
    /** Example words that END in this letter. */
    examples: LetterExample[]
  }
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
    final: {
      form: 'ך',
      examples: [
        { word: "מֶלֶךְ", pic: "👑" },
        { word: "דֶּרֶךְ", pic: "🛣️" },
      ],
    },
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
    final: {
      form: 'ם',
      examples: [
        { word: "עוֹלָם", pic: "🌍" },
        { word: "מַיִם", pic: "💧" },
      ],
    },
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
    final: {
      form: 'ן',
      examples: [
        { word: "עָנָן", pic: "☁️" },
        { word: "אֶבֶן", pic: "🪨" },
      ],
    },
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
    final: {
      form: 'ף',
      examples: [
        { word: "כֶּסֶף", pic: "🪙" },
        { word: "חוֹף", pic: "🏖️" },
      ],
    },
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
    final: {
      form: 'ץ',
      examples: [
        { word: "אֶרֶץ", pic: "🗺️" },
        { word: "עֵץ", pic: "🌳" },
      ],
    },
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
