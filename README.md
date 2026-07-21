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

Scores can be submitted with `POST /api/games/:slug/scores` using JSON such as `{ "playerName": "Zavi", "score": 987650 }`. The MVP validates and acknowledges submissions; persistent storage will be added later.

The Geometry Dash leaderboard reads live score rows from D1 and ranks them by descending score.

## Database

Cloudflare D1 is bound to the Worker as `DB`. Version-controlled SQL migrations live in `migrations/`. Run `npm run db:migrate:local` for local development, and `npm run db:migrate:remote` to apply the same migrations to the configured Cloudflare database. The initial schema defines `games`, `players`, and `scores`; scores reference both their game and player, with leaderboard and player lookup indexes.

## Current games

- Geometry Dash (coming soon)

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
