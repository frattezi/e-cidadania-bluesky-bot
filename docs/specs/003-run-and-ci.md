---

id: "003"
title: Run loop, state, entry point and GitHub Actions cron
status: ready
tags: [backend, ci, jobs]
files: [src/state.ts, src/run.ts, src/main.ts, test/state.test.ts, test/run.test.ts, .github/workflows/, README.md]
depends_on: []
---

# 003 — Run loop, state, entry point and GitHub Actions cron

## Goal

Implement `src/state.ts`, `src/run.ts`, `src/main.ts`, the workflow and the README. Code only against the
contract signatures of the other modules: their bodies are stubs until specs 001 and 002 merge, so
`run.ts` gets everything injected and its tests never import them.

## Requirements

- `state.ts`: `data/posted.json` is a sorted JSON array of numbers. `loadPosted` returns `null` when the
  file is missing, throws on invalid content. `savePosted` writes atomically (temp file + rename) and
  creates the directory.
- `run(deps)`:
  1. `listConsultas()`.
  2. State `null` (first run): save every id, post nothing, return `{ seeded: true, posted: 0, pending: 0 }`.
     Log it.
  3. Otherwise, new = consultas whose id is not in state, oldest first (ascending id).
  4. Post up to `maxPosts`; after **each** successful publish, add the id and save state, so a crash
     mid-run never double posts. A publish error stops the run and propagates (posted ones stay saved).
  5. `dryRun`: log each draft, never publish, never write state.
  6. Return `{ seeded, posted, pending }` (pending = new ones left for the next run).
- `main.ts`: flags `--dry-run`; env `BSKY_IDENTIFIER`, `BSKY_APP_PASSWORD` (required unless dry run),
  `MAX_POSTS_PER_RUN` (default 25), state path `data/posted.json`. Wire `createFetchHtml`,
  `fetchAllConsultas`, `buildPost`, `createPublisher`. Exit non-zero on error; never log secrets.
- `.github/workflows/post.yml`: hourly cron (off the hour, e.g. `17 * * * *`) plus `workflow_dispatch`
  with a `dry_run` boolean input. `concurrency` group without cancel-in-progress, `permissions:
  contents: write`, Node 24 with npm cache, `npm ci`, run, then commit and push `data/posted.json` only
  when it changed (bot identity, message `chore: update posted consultas`). Secrets
  `BSKY_IDENTIFIER`, `BSKY_APP_PASSWORD`.
- `.github/workflows/ci.yml`: on push/PR, run format check, typecheck and tests.
- `README.md`: what it does, setup (Bluesky app password, repo secrets), local dry run, how seeding works.

## Tests

- `state`: missing → null, round trip, sorted output, invalid JSON throws.
- `run` (temp dir for state, all deps stubbed): seeding, posting only new ones in ascending order, the
  `maxPosts` cap with `pending`, dry run writes nothing and publishes nothing, a publish failure keeps
  the earlier ids saved.

## Done when

`npm run format && npm run typecheck && npm test` pass.
