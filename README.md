# Dream Atlas

<p align="center">
  <img src="docs/screenshots/landing-page.png" alt="Dream Atlas" />
</p>


## Screenshots

| Landing | Atlas |
|----------|----------|
| ![](docs/screenshots/landing-page.png) | ![](docs/screenshots/atlas-graph.png) |

| Dream | Dream Weather |
|----------|----------|
| ![](docs/screenshots/dream-page.png) | ![](docs/screenshots/weather-page.png) |

| Archive |
|----------|
| ![](docs/screenshots/archive-page.png) |

Dream Atlas is a private-first dream journal and symbolic analysis platform.

It lets people submit dreams anonymously, map recurring motifs into a living Atlas, browse a filterable archive, and read the collective atmosphere as Dream Weather.

Built for presentation-ready demos and real local-first usage, the app is designed to feel cinematic, resilient, and intentionally minimal about identity.

## Why This Project Exists

Dream Atlas turns dream fragments into a public-but-anonymous cultural map.

- submit a dream without creating an account
- extract symbols, moods, archetypes, and reflective themes
- visualize similarity as a constellation graph
- browse the archive by symbol, emotion, archetype, mood, or search
- read a symbolic weather report from the aggregate archive
- degrade gracefully when the LLM is unavailable

## Product Tour

### Landing

A focused entry point into the archive with a clear call to action.

### Submit

Anonymous dream intake with privacy-first guidance.

### Atlas

An interactive graph of symbolic resemblance between dreams.

### Archive

A searchable, filterable grid of dream fragments.

### Dream Weather

A generated atmosphere report derived from the collective state of the archive.

### Health

A lightweight application and database reachability check exposed at `/api/health`.

## Stack

- Next.js 13.4.12
- React 18
- TypeScript
- Prisma 4.16.0
- SQLite for local persistence
- `react-force-graph-2d` for Atlas visualization
- OpenAI-compatible local LLM endpoint for analysis

## Quick Start

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Open `http://localhost:3000` after the development server starts.

## Environment

Use these variables for local development:

```env
DATABASE_URL="file:./dreamatlas.db"

LLM_PROVIDER=local
LOCAL_LLM_BASE_URL=http://localhost:11434/v1
LOCAL_LLM_API_KEY=local
LOCAL_LLM_MODEL=nous-hermes-8b

DEMO_MODE=true
SIMULATE_LLM_FAILURE=false
```

- `DATABASE_URL` points Prisma at the local SQLite file.
- `LOCAL_LLM_BASE_URL` should expose an OpenAI-compatible `/v1` endpoint.
- `LOCAL_LLM_MODEL` must match the model name exposed by the local server.
- `DEMO_MODE=true` enables presentation-friendly demo behavior.
- `SIMULATE_LLM_FAILURE=true` forces the fallback path for resilience testing.

## Database

Dream Atlas uses SQLite for the MVP and local-first deployment model.

- simple to run locally
- easy to seed for demos
- requires persistent disk in production
- not ideal for stateless serverless deployments
- PostgreSQL is the likely next-step upgrade

## LLM Behavior

Dream Atlas expects a local or self-hosted OpenAI-compatible service.

- dream analysis should continue even if the model is unavailable
- user-facing errors should remain clean and non-technical
- dream submission should never be permanently blocked
- fallback analysis is preferred over hard failures

## Seed Data

Populate the archive with curated atmospheric dreams:

```bash
npm run prisma:seed
```

The seed set is designed to make the Atlas, Archive, and Dream Weather experiences feel alive immediately after setup.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run prisma:seed
```

`npm run build` already runs `prisma generate` before `next build`.

## Deployment Notes

Recommended deployment pattern:

- run the application on a machine with persistent storage
- keep the SQLite database on durable disk
- run the LLM separately and point Dream Atlas to its `/v1` endpoint
- seed the database before demos

If you plan to deploy on serverless infrastructure, migrate to a persistent database strategy first.

## Reliability Notes

- empty states are handled across landing, archive, atlas, and weather views
- includes a global App Router error boundary
- dream similarity and archive browsing work with sparse datasets
- health checks use a lightweight database query
- dream submission remains available during LLM outages

## Roadmap

- PostgreSQL support
- vector embeddings and similarity search
- stronger moderation tooling
- curated exhibitions
- scheduled Dream Weather generation
- 3D Atlas exploration
- ambient audio layer

## Health Check

The application exposes a health endpoint at:

```text
/api/health
```

The endpoint reports application status and verifies database connectivity with a lightweight query.

## Contact

- GitHub: https://github.com/BaverKoca
- LinkedIn: https://www.linkedin.com/in/baver-koca
- Email: baver.koca00@gmail.com
