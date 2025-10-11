import { 
  type Commitment, 
  type InsertCommitment,
  type BankBalance,
  type InsertBankBalance,
  type BankAdjustment,
  type InsertBankAdjustment,
  commitments,
  bankBalance as bankBalanceTable,
  bankAdjustments as bankAdjustmentsTable,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Commitments
  getCommitments(): Promise<Commitment[]>;
  getCommitment(id: string): Promise<Commitment | undefined>;
  createCommitment(commitment: InsertCommitment): Promise<Commitment>;
  updateCommitment(id: string, commitment: InsertCommitment): Promise<Commitment | undefined>;
  deleteCommitment(id: string): Promise<boolean>;
  
  // Bank Balance
  getBankBalance(): Promise<BankBalance>;
  updateBankBalance(balance: InsertBankBalance): Promise<BankBalance>;
  
  // Bank Adjustments
  createBankAdjustment(adjustment: InsertBankAdjustment): Promise<BankAdjustment>;
  getBankAdjustments(): Promise<BankAdjustment[]>;
}

export class DatabaseStorage implements IStorage {
  // Commitments
  async getCommitments(): Promise<Commitment[]> {
    const result = await db
      .select()
      .from(commitments)
      .orderBy(commitments.dueDay);
    return result;
  }

  async getCommitment(id: string): Promise<Commitment | undefined> {
    const [result] = await db
      .select()
      .from(commitments)
      .where(eq(commitments.id, id));
    return result || undefined;
  }

  async createCommitment(insertCommitment: InsertCommitment): Promise<Commitment> {
    const [result] = await db
      .insert(commitments)
      .values({
        type: insertCommitment.type,
        name: insertCommitment.name,
        monthlyCommitment: insertCommitment.monthlyCommitment,
        doneSoFar: insertCommitment.doneSoFar ?? 0,
        balance: insertCommitment.balance ?? 0,
        dueDay: insertCommitment.dueDay,
        isAutomated: insertCommitment.isAutomated ?? false,
      })
      .returning();
    return result;
  }

  async updateCommitment(id: string, insertCommitment: InsertCommitment): Promise<Commitment | undefined> {
    const [result] = await db
      .update(commitments)
      .set({
        type: insertCommitment.type,
        name: insertCommitment.name,
        monthlyCommitment: insertCommitment.monthlyCommitment,
        doneSoFar: insertCommitment.doneSoFar ?? 0,
        balance: insertCommitment.balance ?? 0,
        dueDay: insertCommitment.dueDay,
        isAutomated: insertCommitment.isAutomated ?? false,
      })
      .where(eq(commitments.id, id))
      .returning();
    return result || undefined;
  }

  async deleteCommitment(id: string): Promise<boolean> {
    const result = await db
      .delete(commitments)
      .where(eq(commitments.id, id))
      .returning();
    return result.length > 0;
  }

  // Bank Balance
  async getBankBalance(): Promise<BankBalance> {
    const [result] = await db.select().from(bankBalanceTable);
    
    // If no bank balance exists, create a default one
    if (!result) {
      const [newBalance] = await db
        .insert(bankBalanceTable)
        .values({ balance: 100000 })
        .returning();
      return newBalance;
    }
    
    return result;
  }

  async updateBankBalance(balance: InsertBankBalance): Promise<BankBalance> {
    // Get the current balance record
    const current = await this.getBankBalance();
    
    const [result] = await db
      .update(bankBalanceTable)
      .set({ balance: balance.balance })
      .where(eq(bankBalanceTable.id, current.id))
      .returning();
    return result;
  }

  // Bank Adjustments
  async createBankAdjustment(insertAdjustment: InsertBankAdjustment): Promise<BankAdjustment> {
    const [result] = await db
      .insert(bankAdjustmentsTable)
      .values(insertAdjustment)
      .returning();
    return result;
  }

  async getBankAdjustments(): Promise<BankAdjustment[]> {
    const result = await db
      .select()
      .from(bankAdjustmentsTable)
      .orderBy(desc(bankAdjustmentsTable.timestamp));
    return result;
  }
}

export const storage = new DatabaseStorage();
