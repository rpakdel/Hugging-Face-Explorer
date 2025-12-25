import express from 'express';
import { createServer } from 'http';
import request from 'supertest';

// Only run these integration tests when a DATABASE_URL is provided.
// Avoid importing any DB-dependent modules until we've confirmed the env var exists,
// because server/db.ts will throw if DATABASE_URL is missing.
const HAS_DB_URL = !!process.env.DATABASE_URL;

// Helper to build an app with registered routes (dynamic import to avoid early DB usage)
async function buildApp() {
  const app = express();
  const httpServer = createServer(app);

  // Body parsers to match server/index.ts
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  const { registerRoutes } = await import('../routes');
  await registerRoutes(httpServer, app);
  return { app, httpServer };
}

const maybeDescribe = HAS_DB_URL ? describe : describe.skip;

maybeDescribe('Operations API', () => {
  let dbPool: any | undefined;
  beforeAll(async () => {
    if (HAS_DB_URL) {
      const { pool } = await import('../db');
      dbPool = pool;
    }
  });

  afterAll(async () => {
    if (dbPool) {
      await dbPool.end();
    }
  });

  it('inserts an operation via POST and returns it', async () => {
    const { app } = await buildApp();

    const uniqueText = `vitest-${Date.now()}`;

    const createRes = await request(app)
      .post('/api/operations')
      .set('Content-Type', 'application/json')
      .send({
        task: 'sentiment-analysis',
        input: uniqueText,
        output: [{ label: 'POSITIVE', score: 0.99 }],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body).toMatchObject({
      task: 'sentiment-analysis',
      input: uniqueText,
    });
    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body).toHaveProperty('output');
  });

  it('lists operations via GET and includes the inserted item', async () => {
    const { app } = await buildApp();

    const uniqueText = `vitest-${Date.now()}`;

    // Insert one operation
    const createRes = await request(app)
      .post('/api/operations')
      .set('Content-Type', 'application/json')
      .send({
        task: 'summarization',
        input: uniqueText,
        output: [{ summary_text: 'Short summary' }],
      });

    expect(createRes.status).toBe(201);

    // Fetch list
    const listRes = await request(app).get('/api/operations');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    // Verify our inserted operation exists
    const found = listRes.body.find((op: any) => op.input === uniqueText);
    expect(found).toBeTruthy();
    expect(found.task).toBe('summarization');
  });
});
