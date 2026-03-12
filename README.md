# Self — Artikel

Blog artikel statis dengan estetika pixel art, dibangun menggunakan Deno.

## Prasyarat

- [Deno](https://deno.com) v2.x

## Penggunaan

```bash
# 1. Build artikel (Markdown → HTML)
deno task build

# 2. Jalankan server lokal
deno task serve
# Buka http://localhost:8000

# 3. Build + serve sekaligus
deno task dev
```

## Menambah Artikel Baru

1. Buat file `.md` baru di folder `docs/`
2. Mulai dengan `# Judul Artikel` sebagai baris pertama
3. Tulis isi artikel dengan Markdown biasa
4. Jalankan `deno task build` ulang

## Deploy ke Deno Deploy

1. Push repository ke GitHub
2. Buka [dash.deno.com](https://dash.deno.com) → **New Project**
3. Hubungkan repository
4. Set **Entrypoint** ke `src/server.ts`
5. Tambahkan **Build step**: `deno task build`

> [!NOTE]
> `dist/` di-generate saat build dan tidak perlu di-commit.
> Pastikan build step dijalankan di Deno Deploy sebelum server start.

## Struktur

```
Self/
├── docs/          # Artikel sumber (Markdown)
├── dist/          # Output HTML (auto-generated)
├── src/
│   ├── build.ts   # Generator statis
│   └── server.ts  # Web server (Deno Deploy ready)
├── static/
│   └── style.css  # CSS (pixel art + readable)
├── templates/
│   ├── base.html  # Template dasar HTML
│   └── render.ts  # Template helpers
└── deno.json      # Task runner config
```
