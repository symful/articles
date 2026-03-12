/**
 * server.ts — Static file server for Deno Deploy and local dev
 * Usage: deno run --allow-net --allow-read src/server.ts
 * Deno Deploy: set entrypoint to src/server.ts
 */

import { serveDir } from "jsr:@std/http/file-server";

const DIST_PATH = new URL("../dist", import.meta.url).pathname;

Deno.serve({ port: 8000 }, async (req: Request) => {
  const res = await serveDir(req, {
    fsRoot:         DIST_PATH,
    urlRoot:        "",
    showDirListing: false,
    enableCors:     true,
  });

  if (res.status === 404) {
    try {
      const notFound = await Deno.readTextFile(`${DIST_PATH}/404.html`);
      return new Response(notFound, {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch {
      return new Response("404 Not Found", { status: 404 });
    }
  }

  return res;
});

console.log("Server running on http://localhost:8000");
