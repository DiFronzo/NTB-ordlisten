import { assertEquals } from "@std/assert";
import { normalise, escapeRegex, search } from "../src/search.ts";
import type { SearchResult } from "../src/search.ts";

// ---------------------------------------------------------------------------
// normalise()
// ---------------------------------------------------------------------------

Deno.test("normalise — strips accents from Latin characters", () => {
  assertEquals(normalise("café"), "cafe");
  assertEquals(normalise("naïve"), "naive");
  assertEquals(normalise("résumé"), "resume");
});

Deno.test("normalise — preserves Norwegian æ, ø, å", () => {
  assertEquals(normalise("æra"), "æra");
  assertEquals(normalise("ørn"), "ørn");
  assertEquals(normalise("åtte"), "åtte");
  assertEquals(normalise("ÆØÅ"), "ÆØÅ");
});

Deno.test("normalise — preserves plain ASCII unchanged", () => {
  assertEquals(normalise("hello world"), "hello world");
});

// ---------------------------------------------------------------------------
// escapeRegex()
// ---------------------------------------------------------------------------

Deno.test("escapeRegex — escapes special regex characters", () => {
  assertEquals(escapeRegex("a+b"), "a\\+b");
  assertEquals(escapeRegex("foo.bar"), "foo\\.bar");
  assertEquals(escapeRegex("(test)"), "\\(test\\)");
  assertEquals(escapeRegex("[a]"), "\\[a\\]");
  assertEquals(escapeRegex("a*b?c"), "a\\*b\\?c");
});

Deno.test("escapeRegex — leaves normal text unchanged", () => {
  assertEquals(escapeRegex("hello"), "hello");
  assertEquals(escapeRegex("æøå"), "æøå");
});

// ---------------------------------------------------------------------------
// search()
// ---------------------------------------------------------------------------

Deno.test("search — returns empty for single character query", () => {
  const result: SearchResult = search("a");
  assertEquals(result.count, 0);
  assertEquals(result.matches, []);
});

Deno.test("search — returns empty for empty query", () => {
  const result = search("");
  assertEquals(result.count, 0);
  assertEquals(result.matches, []);
});

Deno.test("search — finds matches with 2+ characters", () => {
  const result = search("ab");
  assertEquals(result.count > 0, true, "Expected at least one match for 'ab'");
  for (const match of result.matches) {
    assertEquals(
      /^[\(]*ab/i.test(normalise(match).toLowerCase()),
      true,
      `Expected '${match}' to start with 'ab'`,
    );
  }
});

Deno.test("search — single char + space triggers search", () => {
  const result = search("a ");
  assertEquals(result.count > 0, true, "Expected matches for 'a '");
});

Deno.test("search — is case-insensitive", () => {
  const lower = search("ab");
  const upper = search("AB");
  assertEquals(lower.count, upper.count);
  assertEquals(lower.matches, upper.matches);
});

Deno.test("search — matches Norwegian characters", () => {
  const result = search("ær");
  assertEquals(result.count > 0, true, "Expected matches for 'ær'");
  for (const match of result.matches) {
    assertEquals(
      match.toLowerCase().startsWith("ær"),
      true,
      `Expected '${match}' to start with 'ær'`,
    );
  }
});

Deno.test("search — ignores leading parenthesis in entries", () => {
  // "(alfakrøll) se krøllalfa" should match "alfa"
  const result = search("alfa");
  const hasParenMatch = result.matches.some((m) => m.startsWith("("));
  assertEquals(hasParenMatch, true, "Expected at least one match starting with '('");
});

Deno.test("search — count equals matches length", () => {
  const result = search("test");
  assertEquals(result.count, result.matches.length);
});

Deno.test("search — escapes regex special chars in query", () => {
  // Should not throw, even with regex-special input
  const result = search("a+b");
  assertEquals(typeof result.count, "number");
  assertEquals(Array.isArray(result.matches), true);
});
