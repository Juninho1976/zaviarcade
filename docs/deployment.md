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

To regenerate Cloudflare binding types after adding a binding, run:

```bash
npm run cf-typegen
```
