import { 
  type Commitment, 
  type InsertCommitment,
  type BankBalance,
  type InsertBankBalance,
  type BankAdjustment,
  type InsertBankAdjustment
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private commitments: Map<string, Commitment>;
  private bankBalance: BankBalance;
  private bankAdjustments: Map<string, BankAdjustment>;

  constructor() {
    this.commitments = new Map();
    this.bankBalance = {
      id: randomUUID(),
      balance: 100000, // Default starting balance
    };
    this.bankAdjustments = new Map();
  }

  // Commitments
  async getCommitments(): Promise<Commitment[]> {
    return Array.from(this.commitments.values()).sort((a, b) => a.dueDay - b.dueDay);
  }

  async getCommitment(id: string): Promise<Commitment | undefined> {
    return this.commitments.get(id);
  }

  async createCommitment(insertCommitment: InsertCommitment): Promise<Commitment> {
    const id = randomUUID();
    const commitment: Commitment = { ...insertCommitment, id };
    this.commitments.set(id, commitment);
    return commitment;
  }

  async updateCommitment(id: string, insertCommitment: InsertCommitment): Promise<Commitment | undefined> {
    const existing = this.commitments.get(id);
    if (!existing) return undefined;
    
    const updated: Commitment = { ...insertCommitment, id };
    this.commitments.set(id, updated);
    return updated;
  }

  async deleteCommitment(id: string): Promise<boolean> {
    return this.commitments.delete(id);
  }

  // Bank Balance
  async getBankBalance(): Promise<BankBalance> {
    return this.bankBalance;
  }

  async updateBankBalance(balance: InsertBankBalance): Promise<BankBalance> {
    this.bankBalance.balance = balance.balance;
    return this.bankBalance;
  }

  // Bank Adjustments
  async createBankAdjustment(insertAdjustment: InsertBankAdjustment): Promise<BankAdjustment> {
    const id = randomUUID();
    const adjustment: BankAdjustment = { ...insertAdjustment, id };
    this.bankAdjustments.set(id, adjustment);
    return adjustment;
  }

  async getBankAdjustments(): Promise<BankAdjustment[]> {
    return Array.from(this.bankAdjustments.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

export const storage = new MemStorage();
