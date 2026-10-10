import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseDictionary } from "../src/dictionary.js";
import { normalise, createSearch } from "../src/search.js";

const entries = parseDictionary(await readFile(new URL("../data/dictionary.txt", import.meta.url), "utf8"));
const search = createSearch(entries);

test("normalise strips accents but preserves Norwegian letters", () => {
  assert.equal(normalise("café naïve résumé ÆØÅ æøå"), "cafe naive resume ÆØÅ æøå");
  assert.equal(normalise("a\u030a"), "å");
});

test("empty, whitespace and one-letter queries have no results", () => {
  for (const query of ["", "a", "  ", " a"]) assert.deepEqual(search(query), { count: 0, matches: [] });
});

test("prefix searches are case-insensitive and ignore leading whitespace", () => {
  assert.ok(search("ab").count > 0);
  assert.deepEqual(search("AB"), search("ab"));
  assert.deepEqual(search("  ab"), search("ab"));
  assert.ok(search("ab").matches.every((entry) => normalise(entry).toLowerCase().startsWith("ab")));
});

test("Norwegian letters remain distinct", () => {
  assert.ok(search("ær").count > 0);
  assert.ok(search("ær").matches.every((entry) => entry.toLowerCase().startsWith("ær")));
  assert.notDeepEqual(search("åp"), search("ap"));
});

test("one-letter plus space matches comma-delimited headwords", () => {
  assert.ok(search("a ").matches.includes("a, a-en, a-er"));
  assert.ok(!search("a ").matches.includes("abbed, -en"));
});

test("leading parentheses are ignored for cross-references", () => {
  assert.ok(search("alfa").matches.includes("(alfakrøll) se krøllalfa"));
});

test("queries are literal, not regex patterns", () => {
  const find = createSearch(["a+b, example", "a.b, example", "axb, example"]);
  assert.deepEqual(find("a+"), { count: 1, matches: ["a+b, example"] });
  assert.deepEqual(find("a."), { count: 1, matches: ["a.b, example"] });
  for (const query of ["[a", "(a", "a*", "\\\\"]) assert.doesNotThrow(() => search(query));
});

test("no does not return a wrapped Norsk Tipping note", () => {
  assert.ok(search("no").count > 0);
  assert.equal(search("no").matches[0], "nobel, -t, noble");
  assert.ok(!search("no").matches.includes("Norsk Tipping)"));
  assert.ok(search("kommisjonær").matches.includes("kommisjonær, -en (k. for Norsk Tipping)"));
});

test("count agrees with matches", () => {
  for (const query of ["test", "no", "ær", "a "]) assert.equal(search(query).count, search(query).matches.length);
});

test("dictionary follows the supplied language norm", () => {
  for (const entry of ["bikkje, -a", "bjørk, -a", "jente, -a", "fram Av", "enda Av, K", "ennå Av"]) {
    assert.ok(entries.includes(entry), entry);
  }
  assert.ok(!entries.includes("frem Av"));
});

test("Norsk Tipping is searchable as its own headword", () => {
  assert.deepEqual(search("Norsk Tipping").matches, ["Norsk Tipping"]);
  assert.ok(search("norsk t").matches.includes("Norsk Tipping"));
});
