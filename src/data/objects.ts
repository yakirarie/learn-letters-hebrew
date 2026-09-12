/**
 * Object names for counting, with grammatical gender agreement.
 * `plural` is used for numbers 2-10.
 */
export type ObjectName = {
  singular: string
  plural: string
}

export const objectNames: Record<string, ObjectName> = {
  "🍎": { singular: "תַּפּוּחַ", plural: "תַּפּוּחִים" },
  "⚽": { singular: "כַּדּוּר", plural: "כַּדּוּרִים" },
  "🌸": { singular: "פֶּרַח", plural: "פְּרָחִים" },
  "🐱": { singular: "חָתוּל", plural: "חֲתוּלִים" },
  "🐟": { singular: "דָּג", plural: "דָּגִים" },
}
