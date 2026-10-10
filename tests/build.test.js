import { test } from "bun:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createSearch } from "../src/search.js";

const root = new URL("../", import.meta.url);

test("build creates a self-contained Pages artifact with repository-relative assets", async () => {
  const build = Bun.spawnSync([process.execPath, "scripts/build.js"], { cwd: fileURLToPath(root) });
  assert.equal(build.exitCode, 0, build.stderr.toString());
  const index = await readFile(new URL("dist/index.html", root), "utf8");
  const norm = await readFile(new URL("dist/spraknorm.html", root), "utf8");
  assert.match(index, /src="\.\/assets\/app\.js"/);
  assert.match(index, /href="\.\/spraknorm"/);
  assert.match(norm, /href="\.\/"/);
  assert.doesNotMatch(index + norm, /(?:href|src)="\/(?!\/)/);
  assert.doesNotMatch(index, /\/api\/search/);
  assert.match(index, /<meta name="description" content="[^"]+"/);
  assert.match(index, /<meta property="og:title"/);
  assert.match(norm, /<meta name="description" content="[^"]+"/);
  assert.match(index + norm, /rel="icon" href="\.\/favicon\.svg"/);
  await access(new URL("dist/favicon.svg", root));
  const notFound = await readFile(new URL("dist/404.html", root), "utf8");
  assert.doesNotMatch(notFound, /(?:href|src)="(?!\/"|data:)[^"]*\.(?:css|js|svg)"/);
  assert.match(notFound, /Siden finnes ikke/);
  await access(new URL("dist/.nojekyll", root));
  await access(new URL("dist/assets/search.js", root));
  const entries = JSON.parse(await readFile(new URL("dist/assets/dictionary.json", root), "utf8"));
  assert.equal(createSearch(entries)("no").matches[0], "nobel, -t, noble");
  const app = await readFile(new URL("dist/assets/app.js", root), "utf8");
  assert.match(app, /addEventListener\("input"/);
  assert.doesNotMatch(app, /innerHTML/);
});
