/** Dictionary data by Rune Wikstøl; original code by Jo Christian Oterhals. */

/** Parse entries, joining source lines wrapped inside parenthetical notes. */
export function parseDictionary(text) {
  const entries = [];
  const balance = (value) => (value.match(/\(/g)?.length ?? 0)
    - (value.match(/\)/g)?.length ?? 0);
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    // A continuation closes parentheses opened on the preceding line. Do not
    // merge unrelated entries after a source typo with a missing closing ')'.
    const previous = entries.at(-1);
    if (previous && balance(previous) > 0 && balance(line) < 0) {
      entries[entries.length - 1] += ` ${line}`;
    } else {
      entries.push(line);
    }
  }
  return Object.freeze(entries);
}
