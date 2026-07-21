# Cloudflare Workers deployment

Zavi Arcade deploys to the Cloudflare Worker named `zaviarcade`. The project uses the OpenNext adapter, so the full Next.js App Router application runs in the Workers runtime rather than being exported as a static Pages site.

## Cloudflare Workers Build settings

The Cloudflare project must use these Git integration settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `npm run deploy` |
| Node.js version | `20.9` or newer |

Workers Builds should be enabled for pull requests to receive preview deployments. Cloudflare automatically deploys pushes to `main` to production and creates previews for pull requests once Git integration is enabled.

Add application secrets and environment variables in **Workers & Pages > zaviarcade > Settings > Variables and Secrets**. Configure a value in every environment that needs it; do not commit secrets or `.dev.vars` files.

## Local commands

```bash
npm run dev
npm run preview
npm run deploy
```

`npm run dev` uses Next.js for fast local development. `npm run preview` first builds the Cloudflare Worker and then runs it locally with Wrangler, which is the closest local match for production. `npm run deploy` builds the Worker and deploys it to Cloudflare.

## Local verification and smoke testing

Before testing score persistence through the local Worker preview, apply the D1 migrations:

```bash
npm run db:migrate:local
```

Run the automated browser journey checks (desktop and mobile) with:

```bash
npm run test:browser
```

For a production-like local smoke test, start the Worker preview:

```bash
npm run preview
```

Then verify `/`, `/games`, `/games/zavi-dash`, `/games/zavi-dash/leaderboard`, `/leaderboards`, and `/about` at `http://localhost:8787`. Play a completed Zavi Dash run, save the score, and confirm it appears on the local leaderboard. After a production deployment, repeat the same route and completed-score checks on the Cloudflare deployment before announcing the release.

To regenerate Cloudflare binding types after adding a binding, run:

```bash
npm run cf-typegen
```

## Applying the Zavi Dash rename migration

Migration `0003_rename_geometry_dash_to_zavi_dash.sql` updates the existing game row in place, preserving its database ID and any related score rows. Run it locally before verifying the renamed routes:

```bash
npm run db:migrate:local
```

After the rename PR has been merged and its Worker deployment is available, apply the same migration to production as part of the release:

```bash
npm run db:migrate:remote
```

Run the remote migration promptly after deployment so the canonical `zavi-dash` application route and D1 record stay aligned.

## Score-submission rate limiting

The Worker configuration declares the `SCORE_SUBMISSION_LIMITER` rate-limit binding. It allows at most 10 score submissions per minute for each client-address key on `POST /api/games/:slug/scores`; the endpoint returns HTTP `429` when the limit is reached.

The binding's namespace ID (`31`) is reserved for Zavi Arcade score submissions. Keep it unique within the Cloudflare account: do not reuse it for another rate-limit binding unless the counters are intentionally shared. Wrangler applies this configuration on the next Worker deployment. The limit is a basic abuse safeguard only; it is not a replacement for server-authoritative run verification, which remains deferred.
