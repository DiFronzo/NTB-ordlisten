import { resolve, sep, extname } from "node:path";

const root = resolve(import.meta.dir, "../dist");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };
const port = Number(Bun.env.PORT ?? 8000);
const server = Bun.serve({
  port,
  hostname: "127.0.0.1",
  async fetch(request) {
    try {
      let path = decodeURIComponent(new URL(request.url).pathname);
      if (path.endsWith("/")) path += "index.html";
      const filePath = resolve(root, `.${path}`);
      if (!filePath.startsWith(root + sep)) {
        return new Response("Forbidden", { status: 403 });
      }
      // Like GitHub Pages: /spraknorm serves spraknorm.html.
      let file = Bun.file(filePath);
      if (!await file.exists() && !extname(filePath)) file = Bun.file(`${filePath}.html`);
      if (!await file.exists()) {
        return new Response(Bun.file(resolve(root, "404.html")), {
          status: 404,
          headers: { "Content-Type": types[".html"] },
        });
      }
      return new Response(file, {
        headers: { "Content-Type": types[extname(file.name)] ?? "application/octet-stream" },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  },
});
console.log(`Open ${server.url}`);
