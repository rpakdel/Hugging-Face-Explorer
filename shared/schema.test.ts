import { describe, it, expect } from 'vitest';
import { insertOperationSchema } from './schema';
import { z } from 'zod';

describe('Shared Schema', () => {
  describe('insertOperationSchema', () => {
    it('validates a correct operation', () => {
      const validData = {
        task: 'sentiment-analysis',
        input: 'I love this!',
        output: { label: 'POSITIVE', score: 0.99 },
      };

      const result = insertOperationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('rejects missing task', () => {
      const invalidData = {
        input: 'I love this!',
        output: { label: 'POSITIVE', score: 0.99 },
      };

      const result = insertOperationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('task');
      }
    });

    it('rejects missing input', () => {
      const invalidData = {
        task: 'sentiment-analysis',
        output: { label: 'POSITIVE', score: 0.99 },
      };

      const result = insertOperationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('input');
      }
    });

    it('rejects invalid types', () => {
      const invalidData = {
        task: 123, // should be string
        input: 'I love this!',
        output: { label: 'POSITIVE', score: 0.99 },
      };

      const result = insertOperationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('task');
      }
    });
  });
});
