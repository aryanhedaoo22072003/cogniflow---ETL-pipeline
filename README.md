# CogniFlow — No-Code ETL Pipeline Builder

A visual, drag-and-drop ETL pipeline builder. Upload a CSV, chain together
transforms on a canvas, run the pipeline, and watch each step execute with
real row counts and logs — no code required.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and MongoDB.

## What's included

- **Full transform suite** (`lib/transforms.ts`): Filter, Rename, Deduplicate,
  Handle Nulls, Expression (calculated columns), Sorter, Rank, Aggregator,
  Router, Union, Joiner, Lookup, Update Strategy (SCD-style change detection),
  Normalizer (unpivot).
- **Visual designer** (`components/DesignerCanvas.tsx`): drag nodes around a
  canvas, connect automatically in pipeline order, configure each step in a
  side panel, upload reference CSVs for join/lookup/union steps.
- **Persistence**: pipelines and every run's execution log are saved to
  MongoDB, so your dashboard, pipeline list, and monitor page are backed by
  real data, not local state.
- **Dashboard shell**: Home (stats + recent activity), Data Integration
  (pipeline list), Monitor (full run history), Connections (source/destination
  catalog).

## Setup

```bash
npm install
cp .env.example .env.local
# then edit .env.local with a real MongoDB Atlas connection string
npm run dev
```

Open `http://localhost:3000`.

## Getting a free MongoDB database

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free M0
   cluster (no credit card required).
2. Create a database user and password.
3. Under Network Access, allow access from anywhere (`0.0.0.0/0`) for local
   dev — tighten this before going to production.
4. Copy the connection string into `MONGODB_URI` in `.env.local`.

## What's intentionally simplified (and why)

- **Auth**: every pipeline is currently owned by a hardcoded `"anonymous"`
  user id in the API routes. This keeps the MVP runnable without needing
  Clerk API keys before you've even seen it work. To add real auth:
  1. `npm install @clerk/nextjs`
  2. Wrap `app/layout.tsx` in `<ClerkProvider>`
  3. Add a `middleware.ts` protecting `/dashboard/*`
  4. Replace `const DEV_OWNER_ID = "anonymous"` in the three API route files
     with the real `userId` from Clerk's `auth()`
- **Expression transform** uses `new Function()` to evaluate things like
  `price * quantity`. That's fine for your own use, but before you let
  strangers type expressions into a hosted version, swap it for a real safe
  expression parser (`mathjs`'s `evaluate` is a drop-in replacement) — see the
  comment directly above `evalExpression` in `lib/transforms.ts`.
- **Router** tags rows with a `route` column instead of physically splitting
  the pipeline into separate branches. A true multi-output DAG is a bigger
  architectural change (nodes would need multiple outgoing edges) — good
  scope for v2.
- **CSV only** as a data source. Postgres/MySQL/Salesforce connectors are
  shown on the Connections page as "coming soon" — wiring one up means adding
  a new API route that queries the external source and returns rows in the
  same `{ rows, headers }` shape the run API already expects.

## Roadmap (from the original problem statement)

- Google/GitHub auth
- Cloud connectors (S3, GCS, Azure Blob)
- Workflow scheduling
- Team collaboration + RBAC
- Pipeline templates
- Real multi-branch DAG execution
- AI-assisted pipeline generation

## Deploying

Push to GitHub, import into Vercel, add `MONGODB_URI` as an environment
variable in the Vercel project settings. Done.
