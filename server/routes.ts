import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import YAML from "yaml";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Load and serve Swagger/OpenAPI documentation
  const openapiPath = path.join(process.cwd(), "openapi.yml");
  const openapiFile = fs.readFileSync(openapiPath, "utf8");
  const openapiSpec = YAML.parse(openapiFile);

  // Serve the OpenAPI spec as JSON
  app.get("/api/openapi.json", (req, res) => {
    res.json(openapiSpec);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
      swaggerOptions: {
        url: "/api/openapi.json",
      },
    }),
  );

  // Security headers for SharedArrayBuffer (required for some transformers.js features)
  app.use((req, res, next) => {
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  });

  app.get(api.operations.list.path, async (req, res) => {
    const ops = await storage.getOperations();
    res.json(ops.reverse()); // Show newest first
  });

  app.post(api.operations.create.path, async (req, res) => {
    try {
      console.log("POST /api/operations - Body:", req.body);
      const input = api.operations.create.input.parse(req.body);
      console.log("Parsed input:", input);
      const op = await storage.createOperation(input);
      console.log("Operation created:", op);
      res.status(201).json(op);
    } catch (err) {
      console.error("Error in POST /api/operations:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  return httpServer;
}
