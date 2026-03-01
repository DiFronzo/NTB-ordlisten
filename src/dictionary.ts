/**
 * Loads and provides the NTB dictionary data.
 *
 * Dictionary data by Rune Wikstøl.
 * Original code by Jo Christian Oterhals (NTB, 2018).
 */

const text = await Deno.readTextFile(
  new URL("../data/dictionary.txt", import.meta.url),
);

/** Every entry line from the dictionary. */
export const entries: readonly string[] = Object.freeze(
  text.split("\n").filter((line) => line.trim() !== ""),
);
