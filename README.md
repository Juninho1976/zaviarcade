# Zavi Arcade

Zavi Arcade is a collection of games, challenges, and experiments built by Zavi and family.

## Getting started

This project requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the arcade.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the local development server. |
| `npm run lint` | Run ESLint. |
| `npm run test` | Run the unit tests. |
| `npm run test:browser` | Run Playwright browser tests at desktop and mobile viewports. |
| `npm run build` | Build the production application. |
| `npm run start` | Serve a production build. |
| `npm run build:worker` | Build the Cloudflare Worker bundle. |
| `npm run preview` | Run the Cloudflare Worker bundle locally. |
| `npm run deploy` | Build and deploy the Worker to Cloudflare. |
| `npm run cf-typegen` | Generate types for Cloudflare bindings. |
| `npm run db:migrate:local` | Apply D1 migrations to the local database. |
| `npm run db:migrate:remote` | Apply D1 migrations to `zaviarcade-db`. |

## Architecture

The application uses the Next.js App Router. Feature code lives in `src/features`, keeping domain types, data, application logic, and UI components separate. Pages in `src/app` compose those feature modules.

Games are defined in the typed registry at `src/features/games/data/games.ts`. Each entry provides its title, description, thumbnail, route, status, and leaderboard metadata so new games can be added without changing the shared game UI.

Zavi Dash Level One is defined as typed, framework-independent course and visual-token data in `src/features/zavi-dash`. Its fixed-timestep game engine is also pure TypeScript, keeping future level content, simulation, and Canvas rendering separate.

The reusable `ZaviDashCanvas` client component renders the game and supports keyboard, mouse, touch, and visible controls. Its diagnostic overlay is enabled in development, or in production only when the component receives an explicit `debug` flag. The live Zavi Dash page adds the run HUD, player-name collection, and completed-run-only score submission.

Zavi Dash uses a fixed-timestep jump simulation. Level validation derives fair maximum gap and obstacle-height limits from those physics values, so manually authored or future generated layouts cannot contain an impossible jump.

Scores can be submitted with `POST /api/games/:slug/scores` using JSON such as `{ "playerName": "Zavi", "score": 1086 }`. The API normalizes player names, validates whole-number scores against the level maximum, persists valid submissions to D1, and returns the saved score ID. The live game only enables submission after a completed run and prevents ordinary duplicate clicks, but client-generated scores are not cheat-proof; server-authoritative verification, authenticated players, and stronger anti-cheat controls are deferred.

The Zavi Dash leaderboard reads live score rows from D1 and ranks them by descending score.
The global `/leaderboards` page lists the available game leaderboards from the game registry.

## Testing the game locally

Run the fast deterministic and local-D1 checks with:

```bash
npm run test
```

Run browser coverage for keyboard, pointer/touch, death, restart, completion, score-submission UI, and leaderboard navigation with:

```bash
npx playwright install chromium
npm run test:browser
```

Install Chromium once after adding dependencies; Playwright’s browser binary is not committed to the repository. The test command starts its own local development server. Its short deterministic game scenarios are enabled only for that test server and are never available in production builds.

## Database

Cloudflare D1 is bound to the Worker as `DB`. Version-controlled SQL migrations live in `migrations/`. Run `npm run db:migrate:local` for local development, and `npm run db:migrate:remote` to apply the same migrations to the configured Cloudflare database. The initial schema defines `games`, `players`, and `scores`; scores reference both their game and player, with leaderboard and player lookup indexes.

## Current games

- Zavi Dash (live)

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- ESLint
- Vitest
- Cloudflare Workers and D1 (planned data service)

## Deployment

The application is deployed through the Cloudflare Worker project `zaviarcade`, with production deployments from `main` and preview deployments for pull requests. See the [Cloudflare Workers deployment guide](docs/deployment.md) for project settings and local deployment commands.

## Status

🚧 Under construction
