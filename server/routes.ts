import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
      const input = api.operations.create.input.parse(req.body);
      const op = await storage.createOperation(input);
      res.status(201).json(op);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  return httpServer;
}
