# Hugging Face Explorer AI Instructions

1. **Big-picture Architecture**
   - The repo combines a single Express process (`server/`) with a Vite + React client (`client/`). In development `server/index.ts` loads `registerRoutes`, sets up logging, and dynamically imports `./vite` after registering API routes so the same process serves both API + frontend.
   - Shared types, route definitions, and schema definitions live under `shared/`. `shared/routes.ts` declares the API contract (Zod schemas for `/api/operations`), while `shared/schema.ts` defines the Drizzle ORM schema used by `server/db.ts` and `drizzle.config.ts`.
   - React entrypoint (`client/src/main.tsx`) renders `App`, which wraps the `Router` (Wouter routes in `client/src/App.tsx`) inside `QueryClientProvider`. UI components live in `client/src/components`, and the project relies heavily on Radix primitives plus `@tanstack/react-query` for async state.

2. **Dev Container & Compose Flow**
   - The official development stack runs with `docker compose up` (see `docker-compose.yml`): `app` builds from `.devcontainer/Dockerfile` (Node 22 + `npm ci`) and waits for `postgres` (PostgreSQL 17 Alpine with `pg_isready`) before running `npm run dev`.
   - `.devcontainer/devcontainer.json` points to that compose stack, forwards `5000` and `5432`, and re-runs `npm install` + `npm run db:push` inside the container so schema migrations match the PostgreSQL service.
   - When running CLI commands, prefer `docker compose run --rm app <script>` to ensure the correct `node_modules` and `DATABASE_URL` are available. Avoid running `npm` scripts on the host.

3. **Key Workflows / Commands**
   - `npm run dev` (in-container) boots `tsx server/index.ts`, which spins up the API, logs `/api` calls, registers routes, and loads Vite in dev mode so hitting `http://localhost:5000` serves the client.
   - To prepare production assets: `npm run build` followed by `npm run start` uses the `dist/index.cjs` bundle produced by `script/build.ts`.
   - Database migrations use Drizzle CLI: `npm run db:push` relies on `shared/schema.ts` and must run against the Postgres service (`docker compose run --rm app npm run db:push`).

4. **Patterns & Integration Points**
   - API contracts in `shared/routes.ts` pair a `z.object` schema with `input` + `output`. Server handlers re-use those validators before touching storage, so mimicking those shape definitions is best when adding client-side forms.
   - **Database & Storage**: All operations are persisted in PostgreSQL. The `server/storage.ts` module implements `IStorage` and `DatabaseStorage` classes that handle fetching and creating operations. It uses Drizzle ORM's `db` instance from `server/db.ts` to query the `operations` table defined in `shared/schema.ts`. Each operation includes `id`, `task`, `input`, `output`, and `createdAt` fields.
   - When adding new persisted data: define the table in `shared/schema.ts`, create corresponding storage methods in `server/storage.ts`, add API routes in `server/routes.ts`, and run `npm run db:push` to migrate the database.
   - React hooks under `client/hooks` (for operations, toast, mobile) rely on the query client from `client/lib/queryClient.ts` and share the same fetch endpoints as defined in the server.
   - The codebase uses absolute import aliases: `@/` points to `client/src/`, `@shared/` points to `shared/`; keep `tsconfig.json` paths in mind when adding imports.

5. **Useful Notes**
   - The Docker stack defines volumes `postgres_data` and `hfe-node-modules` to keep database data and dependencies persistent without installing on the host.
   - Whenever you touch `shared/schema.ts`, ensure migrations are pushed inside the container and the compose stack is restarted so `postgres` and `app` see the same schema state.

Please review and let me know if any section needs clarification or if there are other workflows I should call out.