import { objectNames } from '../data/objects'

/**
 * Hebrew number + noun agreement, ported from the pre-migration app.
 *
 * Hebrew counting is not a simple "number then noun" concatenation:
 *   1     noun first, singular      -> תַּפּוּחַ אֶחָד   (one apple)
 *   2     special construct form    -> שְׁנֵי כַּדּוּרִים (two balls, not שְׁנַיִם)
 *   3-10  number then plural        -> שְׁלוֹשָׁה פְּרָחִים
 *   11+   number then plural        -> אַחַד עָשָׂר תַּפּוּחִים
 *
 * If the emoji is not in the dictionary, there is no noun to agree with, so the
 * bare number word is returned.
 */
export function numberWithObject(
  emoji: string,
  count: number,
  numberWord: string,
): string {
  const noun = objectNames[emoji]
  if (!noun) return numberWord

  if (count === 1) return `${noun.singular} ${numberWord}`
  if (count === 2) return `שְׁנֵי ${noun.plural}`
  return `${numberWord} ${noun.plural}`
}

/** The emoji used to visualise a count, cycling through the pool. */
export const countEmojis = ['🍎', '⚽', '🌸', '🐱', '🐟'] as const

export function emojiForIndex(index: number): string {
  return countEmojis[index % countEmojis.length]
}
