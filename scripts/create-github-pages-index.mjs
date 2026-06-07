import fs from "node:fs/promises";
import path from "node:path";

const siteUrl = "https://rubenslyra.github.io/Betario/";
const docsDir = path.resolve("docs");
const serverEntry = path.resolve("dist/server/server.js");

async function renderStaticHtml(url) {
  const server = await import(serverEntry);
  const response = await server.default.fetch(new Request(url), {}, {});

  if (!response.ok) {
    throw new Error(`SSR render failed for ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  if (!html.includes("$_TSR.router")) {
    throw new Error("SSR render did not include TanStack Router hydration state");
  }

  return html;
}

const html = await renderStaticHtml(siteUrl);

await fs.writeFile(path.join(docsDir, "index.html"), html);
await fs.writeFile(path.join(docsDir, "404.html"), html);
await fs.writeFile(path.join(docsDir, ".nojekyll"), "");
