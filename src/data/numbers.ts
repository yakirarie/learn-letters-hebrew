import type { PaletteKey } from '../lib/palette'

export type NumberDatum = {
  n: number
  /** The Hebrew number word, with nikud. */
  word: string
  pic: string
  palette: PaletteKey
}

/** Numbers 1-30, ported verbatim from the pre-migration index.html. */
export const numbers: NumberDatum[] = [
  { n: 1, word: "אֶחָד", pic: "1️⃣", palette: 'red' },
  { n: 2, word: "שְׁנַיִם", pic: "2️⃣", palette: 'purple' },
  { n: 3, word: "שְׁלוֹשָׁה", pic: "3️⃣", palette: 'indigo' },
  { n: 4, word: "אַרְבָּעָה", pic: "4️⃣", palette: 'teal' },
  { n: 5, word: "חֲמִשָּׁה", pic: "5️⃣", palette: 'green' },
  { n: 6, word: "שִׁשָּׁה", pic: "6️⃣", palette: 'coral' },
  { n: 7, word: "שִׁבְעָה", pic: "7️⃣", palette: 'orange' },
  { n: 8, word: "שְׁמוֹנֶה", pic: "8️⃣", palette: 'yellow' },
  { n: 9, word: "תִּשְׁעָה", pic: "9️⃣", palette: 'brown' },
  { n: 10, word: "עֲשָׂרָה", pic: "🔟", palette: 'slate' },
  { n: 11, word: "אַחַד עָשָׂר", pic: "11", palette: 'red' },
  { n: 12, word: "שְׁנֵים עָשָׂר", pic: "12", palette: 'purple' },
  { n: 13, word: "שְׁלוֹשָׁה עָשָׂר", pic: "13", palette: 'indigo' },
  { n: 14, word: "אַרְבָּעָה עָשָׂר", pic: "14", palette: 'teal' },
  { n: 15, word: "חֲמִשָּׁה עָשָׂר", pic: "15", palette: 'green' },
  { n: 16, word: "שִׁשָּׁה עָשָׂר", pic: "16", palette: 'coral' },
  { n: 17, word: "שִׁבְעָה עָשָׂר", pic: "17", palette: 'orange' },
  { n: 18, word: "שְׁמוֹנָה עָשָׂר", pic: "18", palette: 'yellow' },
  { n: 19, word: "תִּשְׁעָה עָשָׂר", pic: "19", palette: 'brown' },
  { n: 20, word: "עֶשְׂרִים", pic: "20", palette: 'slate' },
  { n: 21, word: "עֶשְׂרִים וְאֶחָד", pic: "21", palette: 'red' },
  { n: 22, word: "עֶשְׂרִים וּשְׁנַיִם", pic: "22", palette: 'purple' },
  { n: 23, word: "עֶשְׂרִים וּשְׁלוֹשָׁה", pic: "23", palette: 'indigo' },
  { n: 24, word: "עֶשְׂרִים וְאַרְבָּעָה", pic: "24", palette: 'teal' },
  { n: 25, word: "עֶשְׂרִים וַחֲמִשָּׁה", pic: "25", palette: 'green' },
  { n: 26, word: "עֶשְׂרִים וְשִׁשָּׁה", pic: "26", palette: 'coral' },
  { n: 27, word: "עֶשְׂרִים וְשִׁבְעָה", pic: "27", palette: 'orange' },
  { n: 28, word: "עֶשְׂרִים וּשְׁמוֹנֶה", pic: "28", palette: 'yellow' },
  { n: 29, word: "עֶשְׂרִים וְתִשְׁעָה", pic: "29", palette: 'brown' },
  { n: 30, word: "שְׁלוֹשִׁים", pic: "30", palette: 'slate' },
]
