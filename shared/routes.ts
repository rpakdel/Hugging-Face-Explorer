import { z } from 'zod';
import { insertOperationSchema, operations } from './schema';

export const api = {
  operations: {
    list: {
      method: 'GET' as const,
      path: '/api/operations',
      responses: {
        200: z.array(z.custom<typeof operations.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/operations',
      input: insertOperationSchema,
      responses: {
        201: z.custom<typeof operations.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
  },
};
