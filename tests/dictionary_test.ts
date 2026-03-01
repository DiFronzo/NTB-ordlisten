import { assertEquals, assertGreater } from "@std/assert";
import { entries } from "../src/dictionary.ts";

Deno.test("dictionary — loads entries", () => {
  assertGreater(entries.length, 20000, "Expected 20 000+ entries");
});

Deno.test("dictionary — no empty lines", () => {
  for (const entry of entries) {
    assertEquals(entry.trim() !== "", true, "Found empty entry");
  }
});

Deno.test("dictionary — first entry is 'a'", () => {
  assertEquals(entries[0].startsWith("a,"), true, `First entry: ${entries[0]}`);
});

Deno.test("dictionary — last entry contains 'åttring'", () => {
  const last = entries[entries.length - 1];
  assertEquals(last.startsWith("åttring"), true, `Last entry: ${last}`);
});

Deno.test("dictionary — is frozen (immutable)", () => {
  assertEquals(Object.isFrozen(entries), true);
});
