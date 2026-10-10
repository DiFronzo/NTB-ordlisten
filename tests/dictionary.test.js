import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseDictionary } from "../src/dictionary.js";

const text = await readFile(new URL("../data/dictionary.txt", import.meta.url), "utf8");
const entries = parseDictionary(text);

test("dictionary contains 20,000+ immutable, nonempty entries", () => {
  assert.ok(entries.length > 20000);
  assert.ok(Object.isFrozen(entries));
  assert.ok(entries.every((entry) => entry && entry === entry.trim()));
  assert.ok(entries[0].startsWith("a,"));
  assert.ok(entries.at(-1).startsWith("åttring"));
});

test("parser handles CRLF and joins parenthetical continuation lines", () => {
  assert.deepEqual(parseDictionary("\r\nkommisjonær, -en (k. for\r\nNorsk Tipping)\r\nkommode, -n\r\n"),
    ["kommisjonær, -en (k. for Norsk Tipping)", "kommode, -n"]);
});

test("parser preserves standalone parenthesised references and separate entries", () => {
  assert.deepEqual(parseDictionary("(alfakrøll) se krøllalfa\nword (missing close\nnext, -en"),
    ["(alfakrøll) se krøllalfa", "word (missing close", "next, -en"]);
});

test("all source notes have balanced parentheses after parsing", () => {
  for (const entry of entries) {
    assert.equal((entry.match(/\(/g) ?? []).length, (entry.match(/\)/g) ?? []).length, entry);
  }
  assert.ok(entries.includes("byte, -n, fl. -, -ene (enhet for datamengde = 8 bit)"));
  assert.ok(entries.includes("kanon, -en (rettesnor; musikk)"));
  assert.ok(!entries.includes("musikk)"));
});

test("dictionary punctuation is no longer mojibake", () => {
  assert.ok(!/[âÂ�]/u.test(text));
});

test("every letter section header is its own entry", () => {
  for (const c of "abcdefghijklmnopqrstuvwxyzæøå") {
    assert.ok(entries.some((e) => e.startsWith(`${c}, ${c}-en, ${c}-er`)), c);
  }
  assert.ok(!entries.some((e) => /[a-zæøå)]([a-zæøå]), \1-en, \1-er/.test(e)));
});

test("wrapped continuation lines are joined to their entry", () => {
  const orphan = /^(jf\. (?!=)|fl\. -|har -|\(.*\)$)/;
  const crossRef = /^\([^)]*\)\s*,?\s*(se|nå)\b/;
  assert.deepEqual(entries.filter((e) => orphan.test(e) && !crossRef.test(e)), []);
  assert.ok(entries.find((e) => e.startsWith("cand. ")).includes("cand.theol"));
  assert.ok(entries.includes("kredit (k. og debet)"));
});

test("entries are free of stray punctuation, spacing issues and duplicates", () => {
  assert.deepEqual(entries.filter((e) => /[,;:]$/.test(e)), []);
  assert.deepEqual(entries.filter((e) => / {2}| [,;]/.test(e)), []);
  assert.equal(new Set(entries).size, entries.length);
});

test("known typos are fixed", () => {
  const all = entries.join("\n");
  for (const bad of ["Krisus", "NewZealand", "kilowatttime", "-1øp(e)t", "båtstø, -aOrd"]) {
    assert.ok(!all.includes(bad), bad);
  }
});
