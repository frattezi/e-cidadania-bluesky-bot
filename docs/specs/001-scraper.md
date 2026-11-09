---

id: "001"
title: Scrape e-Cidadania Consultas Públicas
status: ready
tags: [backend, scraper]
files: [src/http.ts, src/consultas.ts, test/consultas.test.ts, test/http.test.ts, test/fixtures/]
depends_on: []
---

# 001 — Scrape e-Cidadania Consultas Públicas

## Goal

Implement `src/http.ts` and `src/consultas.ts` (stubs hold the contract signatures; keep them).

## What we know about the source (probed 2026-11-09)

- Listing: `https://www12.senado.leg.br/ecidadania/pesquisamateria?p=<n>`, 100 items per page,
  about 79 pages. No API, and the RSS feeds (`/ecidadania/rss.xml`) list portal documents, not consultas.
- Ordered by **vote count**, with no sort parameter (tried `ordenacao`, `ordem`, `ordenarPor`: ignored).
  New consultas have no fixed position, so we must scan every page.
- Pagination links: `href="https://www12.senado.leg.br/ecidadania/pesquisamateria?p=79"`; the last page is
  the max `p` among them.
- Item markup:

```html
<div class="resumo-materia">
  <header><a href="visualizacaomateria?id=160575">PL 5064/2023</a></header>
  <section><a href="visualizacaomateria?id=160575">Concede anistia aos acusados ...</a></section>
  <a href="visualizacaomateria?id=160575"><figure class="grafico-consulta-publica">...</figure></a>
</div>
```

## Requirements

- `parseListingPage(html)`: one `Consulta` per `.resumo-materia`; `identificacao` from the header link
  text, `ementa` from the section link text with whitespace collapsed (it contains newlines), `url` via
  `consultaUrl(id)`. Throws a clear error when an item lacks a numeric id or identificacao: that means
  the markup changed and the run must fail loudly. `lastPage` defaults to 1 with no pagination links.
- `fetchAllConsultas(fetchHtml, { concurrency = 4 })`: fetch page 1, read `lastPage`, fetch 2..lastPage
  with at most `concurrency` requests in flight, dedup by id (votes move items between pages mid-scan).
  Throws when page 1 has zero consultas.
- `createFetchHtml({ retries = 3, timeoutMs = 30000, userAgent })`: global `fetch`, `AbortSignal.timeout`,
  retry on network errors, 429 and 5xx with exponential backoff; throw on other non-2xx. Default UA:
  `e-cidadania-bluesky-bot (+https://github.com/frattezi/e-cidadania-bluesky-bot)`. No email in the UA.

## Tests

- Fixture: save a trimmed real listing page under `test/fixtures/` (a few items, including one ementa with
  a newline, plus the pagination block). Test parsing, whitespace, `lastPage`, the markup-changed error.
- `fetchAllConsultas` with a stub `FetchHtml` serving 3 pages that share one duplicate id.
- `createFetchHtml`: stub global `fetch` (no network) for retry-then-success and throw-on-404.

## Done when

`npm run format && npm run typecheck && npm test` pass.
