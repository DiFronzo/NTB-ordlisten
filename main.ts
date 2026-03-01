import { serveDir } from "@std/http/file-server";
import { search } from "./src/search.ts";

const STATIC_ROOT = "static";

/** Create the request handler (exported for testing). */
export function createHandler(): (req: Request) => Response | Promise<Response> {
  return (req: Request): Response | Promise<Response> => {
    const url = new URL(req.url);

    // API endpoint: GET /api/search?q=...
    if (url.pathname === "/api/search") {
      if (req.method !== "GET") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Allow": "GET",
          },
        });
      }

      const query = url.searchParams.get("q") ?? "";
      const result = search(query);

      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=60",
        },
      });
    }

    // Everything else: serve static files
    return serveDir(req, {
      fsRoot: STATIC_ROOT,
      quiet: true,
      headers: [
        "Cache-Control: public, max-age=3600",
      ],
    });
  };
}

// Only start the server when running as the main module (not during tests).
if (import.meta.main) {
  Deno.serve(createHandler());
}
