---

id: "002"
title: Format and publish Bluesky posts
status: ready
tags: [backend, bluesky]
files: [src/post.ts, src/bluesky.ts, test/post.test.ts, test/bluesky.test.ts]
depends_on: []
---

# 002 — Format and publish Bluesky posts

## Goal

Implement `src/post.ts` and `src/bluesky.ts` (stubs hold the contract signatures; keep them).

## Requirements

- `buildPost(consulta)` returns a `PostDraft`:
  - `text` (pt-BR), at most **300 graphemes** (count with `Intl.Segmenter`, not `.length`):

    ```
    Nova consulta pública no Senado: {identificacao}

    {ementa}

    Vote no e-Cidadania 👇
    ```

    When too long, truncate only the ementa, at a word boundary, and end it with `…`.
  - `card`: `uri` = `consulta.url`, `title` = `{identificacao} — Consulta Pública`,
    `description` = full ementa.
- `createPublisher({ identifier, password, service = "https://bsky.social" })`: `AtpAgent` login once,
  returns a `PublishPost` that calls `agent.post` with `text`, `langs: ["pt"]`, `createdAt`, and an
  `app.bsky.embed.external` embed built from `card` (no thumbnail). Errors propagate.

## Tests

- `buildPost`: short ementa passes through untouched; a long one is cut at a word boundary with `…` and
  the text is exactly ≤ 300 graphemes; the card fields.
- `createPublisher`: no network. Make it testable through an optional injected agent factory or similar
  (keep the contract signature compatible) and assert the payload sent to `post`.

## Done when

`npm run format && npm run typecheck && npm test` pass.
