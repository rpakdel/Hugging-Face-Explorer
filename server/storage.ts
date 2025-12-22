import { db } from "./db";
import { operations, type InsertOperation, type Operation } from "@shared/schema";

export interface IStorage {
  getOperations(): Promise<Operation[]>;
  createOperation(op: InsertOperation): Promise<Operation>;
}

export class DatabaseStorage implements IStorage {
  async getOperations(): Promise<Operation[]> {
    return await db.select().from(operations).orderBy(operations.createdAt);
  }

  async createOperation(op: InsertOperation): Promise<Operation> {
    const [operation] = await db.insert(operations).values(op).returning();
    return operation;
  }
}

export const storage = new DatabaseStorage();
