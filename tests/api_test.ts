import { assertEquals, assertGreater, assertStringIncludes } from "@std/assert";
import { createHandler } from "../main.ts";

const handler = createHandler();

// ---------------------------------------------------------------------------
// GET /api/search
// ---------------------------------------------------------------------------

Deno.test("API — GET /api/search returns JSON with results", async () => {
  const req = new Request("http://localhost/api/search?q=ab");
  const res = await handler(req);

  assertEquals(res.status, 200);
  assertStringIncludes(
    res.headers.get("Content-Type") ?? "",
    "application/json",
  );

  const body = await res.json();
  assertGreater(body.count, 0);
  assertEquals(Array.isArray(body.matches), true);
  assertEquals(body.count, body.matches.length);
});

Deno.test("API — GET /api/search with empty query returns zero results", async () => {
  const req = new Request("http://localhost/api/search?q=");
  const res = await handler(req);

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.count, 0);
  assertEquals(body.matches, []);
});

Deno.test("API — GET /api/search without q param returns zero results", async () => {
  const req = new Request("http://localhost/api/search");
  const res = await handler(req);

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.count, 0);
});

Deno.test("API — GET /api/search with Norwegian chars works", async () => {
  const req = new Request("http://localhost/api/search?q=%C3%A6r");
  const res = await handler(req);

  assertEquals(res.status, 200);
  const body = await res.json();
  assertGreater(body.count, 0);
});

Deno.test("API — GET /api/search sets cache header", async () => {
  const req = new Request("http://localhost/api/search?q=test");
  const res = await handler(req);

  assertStringIncludes(
    res.headers.get("Cache-Control") ?? "",
    "max-age=60",
  );
  await res.body?.cancel();
});

// ---------------------------------------------------------------------------
// Method not allowed
// ---------------------------------------------------------------------------

Deno.test("API — POST /api/search returns 405", async () => {
  const req = new Request("http://localhost/api/search?q=test", {
    method: "POST",
  });
  const res = await handler(req);

  assertEquals(res.status, 405);
  assertEquals(res.headers.get("Allow"), "GET");
  const body = await res.json();
  assertEquals(body.error, "Method not allowed");
});

// ---------------------------------------------------------------------------
// Static file serving
// ---------------------------------------------------------------------------

Deno.test("API — GET / serves index.html", async () => {
  const req = new Request("http://localhost/");
  const res = await handler(req);

  assertEquals(res.status, 200);
  const text = await res.text();
  assertStringIncludes(text, "NTB-ordlisten");
});

Deno.test("API — GET /nonexistent returns 404", async () => {
  const req = new Request("http://localhost/nonexistent.xyz");
  const res = await handler(req);

  assertEquals(res.status, 404);
  await res.body?.cancel();
});
