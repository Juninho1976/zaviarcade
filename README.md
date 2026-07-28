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

The reusable `ZaviDashCanvas` client component renders the game and supports keyboard, mouse, touch, and visible controls. Its diagnostic overlay is enabled in development, or in production only when the component receives an explicit `debug` flag. The live Zavi Dash page adds the run HUD and automatically submits a score when an authenticated player's attempt ends through death or completion.

Zavi Dash uses a fixed-timestep jump simulation. Level validation derives fair maximum gap, obstacle-height, and obstacle-width limits from those physics values, so manually authored or future generated layouts cannot contain an impossible jump.

Zavi Arcade uses Better Auth with D1-backed username/password accounts and server-side sessions. The permanent account ID is separate from username, display name, credentials and role. Better Auth's provider-account records allow a future federated identity to link to that same ID without changing how games identify owners. Public registration and player email collection are disabled.

Games obtain their player from the shared server-side `requirePlayer()` contract. Scores can be submitted with `POST /api/games/:slug/scores` using JSON such as `{ "score": 1086, "submissionId": "123e4567-e89b-42d3-a456-426614174000" }`; the endpoint derives `user_id` only from the authenticated session. Zavi Dash accepts run scores up to its deterministic maximum. A client-generated UUID makes retries idempotent. Client-generated scores are still not fully cheat-proof; server-authoritative replay verification remains deferred.

The Zavi Dash leaderboard joins each stable score owner to the account's current display name and ranks scores by descending score. Display names are deliberately non-unique; changing one updates historical leaderboard presentation without moving score ownership.
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

Cloudflare D1 is bound to the Worker as `DB`. Version-controlled SQL migrations live in `migrations/`. Run `npm run db:migrate:local` for local development, and `npm run db:migrate:remote` only as part of the reviewed release process.

Migration `0006_add_player_accounts.sql` adds Better Auth users, sessions, provider accounts, verification and database-backed rate limits. It rebuilds scores around `user_id`. A read-only production check on 2026-07-28 found exactly one nonessential legacy row (`scores.id = 1`, display name `RAK`, score `80`); the migration resets only legacy scores/players before creating authenticated ownership.

## Account administration

There is no registration page. An administrator creates and manages players at `/admin/players`, including temporary passwords, username/display-name changes, password reset and account enable/disable. Passwords are shown only in the creation/reset response. Players ask the administrator or parent for recovery; there is no email recovery or security-question flow.

Configure `AUTH_SECRET` and the temporary `ADMIN_BOOTSTRAP_TOKEN` through Wrangler, never source control. Set `BETTER_AUTH_URL=https://www.zaviarcade.com` as a Worker environment variable. After applying migrations, create the first administrator once:

```bash
curl -X POST https://www.zaviarcade.com/api/admin/bootstrap \
  -H "Authorization: Bearer $ADMIN_BOOTSTRAP_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"username":"your-admin-nickname","displayName":"Arcade Admin","password":"a-long-unique-password"}'
```

The endpoint refuses to create another administrator once one active administrator exists. Remove `ADMIN_BOOTSTRAP_TOKEN` from the Worker after bootstrap. Do not put real bootstrap or account credentials in `.env.example`.

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
