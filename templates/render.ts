// Article index page template
export function renderIndex(articles: Array<{
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  tag: string;
}>): string {
  const cards = articles.map((a) => `
    <a class="article-card pixel-border" href="./articles/${a.slug}.html">
      <span class="card-tag">${a.tag}</span>
      <h2 class="card-title">${a.title}</h2>
      <p class="card-excerpt">${a.excerpt}</p>
      <div class="card-meta">
        <span>${a.readTime}</span>
        <span class="read-more">&gt; Baca &rarr;</span>
      </div>
    </a>
  `).join('');

  return `
    <section class="page-hero">
      <h1>// VAYNE<span class="blink">_</span></h1>
      <p>Catatan, pemikiran, dan hal-hal yang saya pelajari.</p>
    </section>
    <hr class="divider" />
    <div class="articles-grid">
      ${cards || '<div class="empty-state"><p>Belum ada artikel.</p></div>'}
    </div>
  `;
}

// Article page template
export function renderArticle(opts: {
  title: string;
  tag: string;
  readTime: string;
  htmlContent: string;
  toc: Array<{ id: string; text: string }>;
}): string {
  const tocHtml = opts.toc.length > 1
    ? `<nav class="toc pixel-border">
        <div class="toc-title">&gt; Daftar Isi</div>
        <ul>
          ${opts.toc.map((h) => `<li><a href="#${h.id}">${h.text}</a></li>`).join('')}
        </ul>
      </nav>`
    : '';

  return `
    <article>
      <header class="article-header">
        <p class="breadcrumb"><a href="../index.html">← Kembali</a> / ${escapeHtml(opts.tag)}</p>
        <h1>${opts.title}</h1>
        <div class="meta">
          <span class="meta-tag">${opts.tag}</span>
          <span>${opts.readTime}</span>
        </div>
      </header>
      ${tocHtml}
      <div class="prose">
        ${opts.htmlContent}
      </div>
      <a class="back-btn" href="../index.html">← Semua Artikel</a>
    </article>
  `;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
