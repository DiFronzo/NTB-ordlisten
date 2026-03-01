/**
 * Search logic for the NTB dictionary.
 */

import { entries } from "./dictionary.ts";

/**
 * Normalise a string: strip combining diacritics but keep Norwegian æ, ø, å.
 *
 * After NFD decomposition:
 *   - æ (U+00E6), ø (U+00F8), Æ, Ø do NOT decompose — they're safe.
 *   - å → a + U+030A (combining ring above) — we must protect that.
 *   - Å → A + U+030A
 *
 * Strategy: NFD → replace a+̊ / A+̊ back to å/Å → strip remaining combiners.
 */
export function normalise(str: string): string {
  return str
    .normalize("NFD")
    .replace(/a\u030A/g, "å")
    .replace(/A\u030A/g, "Å")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Escape special regex characters in a string. */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface SearchResult {
  /** Total number of matches. */
  count: number;
  /** The matching dictionary entries. */
  matches: string[];
}

/**
 * Search the dictionary for entries starting with the given query.
 * Requires at least 2 characters (a trailing space counts).
 * Leading parentheses in entries are ignored during matching.
 */
export function search(query: string): SearchResult {
  const normalised = normalise(query);

  if (normalised.length < 2) {
    return { count: 0, matches: [] };
  }

  const escaped = escapeRegex(normalised);
  const re = new RegExp("^\\(*" + escaped, "i");

  const matches: string[] = [];

  for (const entry of entries) {
    const line = normalise(entry).toLowerCase();
    if (re.test(line)) {
      matches.push(entry);
    }
  }

  return { count: matches.length, matches };
}
