# e-cidadania-bluesky-bot

Bot that posts every new **Consulta Pública** from the Senate's e-Cidadania portal to Bluesky.
Runs hourly on GitHub Actions; state (IDs already posted) is a JSON file committed back to the repo.

## Stack

- Node 24, TypeScript run natively (type stripping): no build step. `tsc` only typechecks.
- Only erasable TS syntax (no enums, namespaces, parameter properties). Relative imports end in `.ts`.
- Deps: `@atproto/api` (Bluesky), `cheerio` (HTML parsing). Tests: built-in `node:test`. Lint/format: Biome.

## Commands

- `npm test` — all tests (`node --test`)
- `npm run typecheck` — `tsc`
- `npm run lint` / `npm run format` — Biome check / fix
- `npm run dry-run` — full scrape, prints the posts it would make, writes nothing
- `npm start` — real run (needs `.env`, see `.env.example`)

Before finishing any change: `npm run format && npm run typecheck && npm test`.

## Architecture

| Module             | Role                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| `src/types.ts`     | Shared contract (`Consulta`, `FetchHtml`, `PostDraft`, `PublishPost`).               |
| `src/http.ts`      | `createFetchHtml`: fetch with retries, timeout, User-Agent.                          |
| `src/consultas.ts` | Parse and paginate the e-Cidadania listing into `Consulta[]`.                        |
| `src/post.ts`      | `buildPost`: `Consulta` to `PostDraft` (pt-BR text + link card).                     |
| `src/bluesky.ts`   | `createPublisher`: login and post through `@atproto/api`.                            |
| `src/state.ts`     | Load/save the posted-ID set (`data/posted.json`).                                    |
| `src/run.ts`       | One run: list, diff against state, post up to the cap, save state. All I/O injected. |
| `src/main.ts`      | Entry point: reads env and flags, wires the real modules into `run`.                 |

Exported signatures in these files are the contract. Change one only with the main session's approval.

## Rules

- Post copy (Bluesky text) is **pt-BR**; code, commits, docs in English.
- External calls (e-Cidadania, Bluesky) are always stubbed in tests. Never hit the network in `npm test`.
- Never post from tests or dry-run. Never commit `.env`.
- First run (no state file) seeds state with every current consulta and posts nothing, so the
  ~7,900 existing consultas are never posted as backlog.

## Specs

Tasks live in `docs/specs/NNN-<slug>.md` with frontmatter (`id`, `status`: ready | in-progress | done,
`tags`, `files` it owns, `depends_on`). A worker edits only the files its spec owns.
