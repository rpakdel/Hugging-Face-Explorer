# Hugging Face Explorer

This monorepo bundles an Express/Drizzle-based API with a Vite + React client so you can explore and persist model operations from a single server process.

## Architecture

- **Server** (`server/`) builds on Express/Drizzle, serving both API routes and the Vite client when `NODE_ENV=production`. The core entrypoint is `server/index.ts`; it wires up middleware, logging, error handling, and `registerRoutes` (operations list/create with validation via Zod).
- **Client** (`client/`) is a Vite + React app that mounts `App` in `client/src/main.tsx` and uses `react-query` with Wouter routing to show operation history and a status page that falls back to a not-found view.
- **Shared** (`shared/`) keeps route schemas and any shared typings between client and server.
- **Database** relies on Drizzle ORM; recreate the schema within the container via `docker compose run --rm app npm run db:push` after editing `shared/schema.ts`.

## Getting Started

1. Install Docker (and Docker Compose if it is not bundled with your Docker engine).
2. Start the development stack:
   ```bash
   docker compose up
   ```
   This builds the app image, starts PostgreSQL, installs dependencies, and runs `npm run dev` inside the container.
3. Browse to the forwarded port at `http://localhost:5000` after the health checks pass.

## Dev Container / Docker

- `.devcontainer/devcontainer.json` is configured to use `docker-compose.yml`, which orchestrates two services:
  - **app**: Node 22 with dependencies installed, running `npm run dev` on port 5000.
  - **postgres**: PostgreSQL 17 on port 5432, with automatic schema setup via `npm run db:push`.
  
- To develop in VS Code:
  1. Open the folder and run `Dev Containers: Reopen in Container`.
  2. The container will build, start PostgreSQL, install dependencies, and initialize the database automatically.
  3. The app will be available on the forwarded port 5000.

To run from the command line:
  ```bash
  docker compose up
  ```
  The app and database will start together. Access the app at `http://localhost:5000`.

## API Overview

- `GET /api/operations` returns **stored operations from the database** (newest first).
- `POST /api/operations` creates a new operation using the shared Zod schema from `shared/routes.ts`, then **persists it to the database**; invalid payloads return a `400` with the validation message.

## Database Storage

All operations are persisted in PostgreSQL via Drizzle ORM:
- **Table**: `operations` (defined in `shared/schema.ts`)
- **Fields**: `id`, `task`, `input`, `output`, `createdAt`
- **Storage Layer**: `server/storage.ts` provides the `DatabaseStorage` class that handles all read/write operations
- The database is automatically initialized and migrated when the dev container starts

## Testing & Safety

- Type checking: `docker compose run --rm app npm run check` executes `tsc` inside the app container.
- Database migrations: `docker compose run --rm app npm run db:push` keeps the database schema in sync with Drizzle definitions; the `DATABASE_URL` is already wired from the compose stack.

## Environment Variables

| Name         | Description                            | Default    |
|--------------|----------------------------------------|------------|
| `PORT`       | Server/Vite listen port                 | `5000`     |
| `NODE_ENV`   | Toggles dev/production behavior         | `development` |

## Next Steps

- Feed real data into `shared/routes.ts` to extend the operation tracking API.
- Add automated tests for new pages/components under `client/src/pages` and `server/routes.ts`.
