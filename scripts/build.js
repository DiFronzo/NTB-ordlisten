import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseDictionary } from "../src/dictionary.js";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);
await rm(dist, { recursive: true, force: true });
await cp(new URL("static/", root), dist, { recursive: true });
await mkdir(new URL("assets/", dist), { recursive: true });
for (const file of ["app.js", "search.js"]) {
  await cp(new URL(`src/${file}`, root), new URL(`assets/${file}`, dist));
}
const entries = parseDictionary(await Bun.file(new URL("data/dictionary.txt", root)).text());
await Bun.write(new URL("assets/dictionary.json", dist), JSON.stringify(entries));
await Bun.write(new URL(".nojekyll", dist), "");
console.log(`Built ${entries.length} dictionary entries in ${fileURLToPath(dist)}`);
