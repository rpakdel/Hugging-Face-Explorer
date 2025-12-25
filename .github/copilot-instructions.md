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

5. **Client Architecture & Model Pipelines**
   - The client uses **`@xenova/transformers`** (Transformers.js), a JavaScript/WebAssembly port of Hugging Face Transformers. All model inference runs 100% client-side in the browser—no backend API calls needed for predictions.
   - **Core Component**: `client/src/components/model-runner.tsx` handles the UI and model execution. Key state includes: `task` (selected model task), `input` (user text), `output` (model results), `isProcessing` (loading state), `progress` (model download %), and `modelStatus` (status message).
   - **Pipeline Flow**: `const pipe = await pipeline(task, undefined, { progress_callback })` loads/caches a model for the task. First run downloads (~50-200MB), subsequent runs use browser cache. Then `result = await pipe(input)` or `await pipe(input, { params })` runs inference.
   - **Task Configuration** in TASK_OPTIONS array includes `sentiment-analysis`, `text-generation`, `summarization`, `translation_en_to_fr`, and can be extended with `token-classification` (NER), `question-answering`, `zero-shot-classification`, etc.
   - **Adding a New Task**: (1) Add entry to TASK_OPTIONS with value, label, description. (2) Add pipeline init in `runModel()` function—most tasks use `await pipe(input)` but some take params like `{ max_new_tokens: 50 }` for text-generation or `{ context, question }` for QA. (3) Add output rendering in `renderOutput()` function to format task-specific results (e.g., sentiment returns `[{ label, score }]`, NER returns array of entities). (4) Optionally add icon mapping in `history-list.tsx` for UI consistency.
   - **Data Persistence**: After inference, `createOperation.mutate({ task, input, output })` saves the operation to the server via POST `/api/operations`, which stores in PostgreSQL and automatically refetches history in HistoryList component.
   - **React Query Integration**: `useOperations()` hook fetches operation history; `useCreateOperation()` mutation saves new results and invalidates the query to refresh the list.

6. **Useful Notes**
   - The Docker stack defines volumes `postgres_data` and `hfe-node-modules` to keep database data and dependencies persistent without installing on the host.
   - Whenever you touch `shared/schema.ts`, ensure migrations are pushed inside the container and the compose stack is restarted so `postgres` and `app` see the same schema state.
   - Models are cached in the browser's IndexedDB. First run of a model task takes 1-2 minutes (download), subsequent runs are instant.
   - The Swagger UI is available at `/api-docs` for testing API endpoints directly. OpenAPI spec is served at `/api/openapi.json`.
   - When debugging the client, use browser DevTools (F12) to check network requests, inspect component state with React DevTools extension, and monitor model loading progress in the Network tab.