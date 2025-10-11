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
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Commitments
  getCommitments(month?: number, year?: number): Promise<Commitment[]>;
  getCommitment(id: string): Promise<Commitment | undefined>;
  createCommitment(commitment: InsertCommitment): Promise<Commitment>;
  updateCommitment(id: string, commitment: InsertCommitment): Promise<Commitment | undefined>;
  deleteCommitment(id: string): Promise<boolean>;
  
  // Bank Balance
  getBankBalance(): Promise<BankBalance>;
  updateBankBalance(balance: InsertBankBalance): Promise<BankBalance>;
  
  // Bank Adjustments
  createBankAdjustment(adjustment: InsertBankAdjustment): Promise<BankAdjustment>;
  getBankAdjustments(month?: number, year?: number): Promise<BankAdjustment[]>;
}

export class DatabaseStorage implements IStorage {
  // Commitments
  async getCommitments(month?: number, year?: number): Promise<Commitment[]> {
    const query = db.select().from(commitments);
    
    if (month !== undefined && year !== undefined) {
      const result = await query
        .where(and(eq(commitments.month, month), eq(commitments.year, year)))
        .orderBy(commitments.dueDay);
      return result;
    }
    
    // If no month/year specified, return current month's commitments
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const result = await query
      .where(and(eq(commitments.month, currentMonth), eq(commitments.year, currentYear)))
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
        month: insertCommitment.month,
        year: insertCommitment.year,
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
        month: insertCommitment.month,
        year: insertCommitment.year,
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

  async getBankAdjustments(month?: number, year?: number): Promise<BankAdjustment[]> {
    const query = db.select().from(bankAdjustmentsTable);
    
    if (month !== undefined && year !== undefined) {
      const result = await query
        .where(and(eq(bankAdjustmentsTable.month, month), eq(bankAdjustmentsTable.year, year)))
        .orderBy(desc(bankAdjustmentsTable.timestamp));
      return result;
    }
    
    const result = await query.orderBy(desc(bankAdjustmentsTable.timestamp));
    return result;
  }
}

export const storage = new DatabaseStorage();
