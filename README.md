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

## Architecture

The application uses the Next.js App Router. Feature code lives in `src/features`, keeping domain types, data, application logic, and UI components separate. Pages in `src/app` compose those feature modules.

## Current games

- Geometry Dash Leaderboard (coming soon)

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- ESLint
- Vitest
- Cloudflare Pages, Workers, and D1 (planned deployment and data services)

## Status

🚧 Under construction
