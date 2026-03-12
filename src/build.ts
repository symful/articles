/**
 * build.ts — Static site generator for Self articles
 * Usage: deno run --allow-read --allow-write src/build.ts
 */

import { CSS, render } from "@deno/gfm";
import { renderIndex, renderArticle } from "../templates/render.ts";

const DOCS_DIR   = new URL("../docs/",      import.meta.url).pathname;
const DIST_DIR   = new URL("../dist/",      import.meta.url).pathname;
const STATIC_DIR = new URL("../static/",    import.meta.url).pathname;
const BASE_TPL   = new URL("../templates/base.html", import.meta.url).pathname;

// ── Helpers ───────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name.replace(/\.md$/, "");
}

/** Estimate reading time (200 wpm) */
function readTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const mins  = Math.max(1, Math.round(words / 200));
  return `${mins} menit baca`;
}

/** Extract first paragraph as excerpt */
function excerpt(text: string, maxLen = 200): string {
  const lines = text.split("\n").map((l) => l.trim());
  const para  = lines.find((l) => l && !l.startsWith("#") && !l.startsWith("---") && !l.startsWith("*"));
  const raw   = para ?? "";
  return raw.length > maxLen ? raw.slice(0, maxLen) + "…" : raw;
}

/** Extract H2 headings for ToC */
function extractToc(md: string): Array<{ id: string; text: string }> {
  const toc: Array<{ id: string; text: string }> = [];
  for (const line of md.split("\n")) {
    const m = line.match(/^## (.+)/);
    if (m) {
      const text = m[1].trim();
      // Replicate @deno/gfm's heading id behavior
      const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      toc.push({ id, text });
    }
  }
  return toc;
}

/** Detect article tag from filename prefix */
function detectTag(filename: string): string {
  if (filename.startsWith("1")) return "Artikel";
  if (filename.startsWith("2")) return "Essay";
  if (filename.startsWith("3")) return "Review";
  return "Tulisan";
}

/** Parse H1 as page title */
function parseTitle(md: string): string {
  for (const line of md.split("\n")) {
    const m = line.match(/^# (.+)/);
    if (m) return m[1].trim();
  }
  return "Tanpa Judul";
}

function loadBase(): string {
  return Deno.readTextFileSync(BASE_TPL);
}

function injectBase(base: string, opts: {
  pageTitle: string;
  metaDesc: string;
  root: string;
  content: string;
}): string {
  return base
    .replaceAll("{{PAGE_TITLE}}",     opts.pageTitle)
    .replaceAll("{{META_DESCRIPTION}}", opts.metaDesc)
    .replaceAll("{{ROOT}}",           opts.root)
    .replaceAll("{{CONTENT}}",        opts.content);
}

// ── Main ──────────────────────────────────────────────────────────────

async function build() {
  // 1. Create output dirs
  await Deno.mkdir(DIST_DIR,                    { recursive: true });
  await Deno.mkdir(DIST_DIR + "articles/",      { recursive: true });

  // 2. Copy static files (CSS, etc.)
  for await (const entry of Deno.readDir(STATIC_DIR)) {
    if (entry.isFile) {
      await Deno.copyFile(STATIC_DIR + entry.name, DIST_DIR + entry.name);
    }
  }

  // 3. Inject @deno/gfm CSS into style.css
  const gfmCss  = `\n/* @deno/gfm markdown styles */\n${CSS}\n`;
  const current = await Deno.readTextFile(DIST_DIR + "style.css");
  if (!current.includes("@deno/gfm")) {
    await Deno.writeTextFile(DIST_DIR + "style.css", current + gfmCss);
  }

  // 4. Process each markdown file
  const base     = loadBase();
  const articles: Array<{
    slug: string;
    title: string;
    excerpt: string;
    readTime: string;
    tag: string;
  }> = [];

  const entries: string[] = [];
  for await (const entry of Deno.readDir(DOCS_DIR)) {
    if (entry.isFile && entry.name.endsWith(".md")) {
      entries.push(entry.name);
    }
  }
  entries.sort();

  for (const filename of entries) {
    const slug  = slugify(filename);
    const md    = await Deno.readTextFile(DOCS_DIR + filename);
    const title = parseTitle(md);
    const tag   = detectTag(filename);
    const rt    = readTime(md);
    const exc   = render(excerpt(md), { allowIframes: false });
    const toc   = extractToc(md);

    // Convert MD → HTML using @deno/gfm
    const htmlContent = render(md, { allowIframes: false });

    // Build article page
    const articleBody = renderArticle({ title, tag, readTime: rt, htmlContent, toc });
    const articleHtml = injectBase(base, {
      pageTitle: title,
      metaDesc:  exc,
      root:      "..",
      content:   articleBody,
    });

    await Deno.writeTextFile(`${DIST_DIR}articles/${slug}.html`, articleHtml);
    console.log(`  [✓] articles/${slug}.html`);

    articles.push({ slug, title, excerpt: exc, readTime: rt, tag });
  }

  // 5. Build index page
  const indexBody = renderIndex(articles);
  const indexHtml = injectBase(base, {
    pageTitle: "Semua Artikel",
    metaDesc:  "Kumpulan tulisan, analisis, dan esai.",
    root:      ".",
    content:   indexBody,
  });
  await Deno.writeTextFile(DIST_DIR + "index.html", indexHtml);
  console.log("  [✓] index.html");

  console.log(`\n✓ Build selesai → dist/ (${articles.length} artikel)`);
}

await build();
