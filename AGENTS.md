# AI Agent Instructions

For detailed instructions regarding the architecture, development workflow, key commands, and integration points of this repository, please refer to the [GitHub Copilot Instructions](.github/copilot-instructions.md).

## General Guidelines

* **Follow Existing Patterns:** Adhere to the coding style and patterns described in the linked instructions and observed in the codebase.
* **Testing:** Ensure that any new code is properly tested using the existing testing framework (Vitest for frontend/unit tests, Supertest for backend integration).
* **Type Safety:** Maintain strict type safety with TypeScript. Run `npm run check` to verify types.
* **Database:** When modifying the database schema, ensure `shared/schema.ts` is updated and migrations are handled correctly as described in the architecture docs.
