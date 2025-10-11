import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Commitment/Expense tracking
export const commitments = pgTable("commitments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "Fixed" or "Variable"
  name: text("name").notNull(),
  monthlyCommitment: integer("monthly_commitment").notNull(),
  doneSoFar: integer("done_so_far").notNull().default(0),
  balance: integer("balance").notNull().default(0),
  dueDay: integer("due_day").notNull(),
  isAutomated: boolean("is_automated").notNull().default(false),
});

export const insertCommitmentSchema = createInsertSchema(commitments).omit({
  id: true,
});

export type InsertCommitment = z.infer<typeof insertCommitmentSchema>;
export type Commitment = typeof commitments.$inferSelect;

// Bank balance adjustments
export const bankAdjustments = pgTable("bank_adjustments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertBankAdjustmentSchema = createInsertSchema(bankAdjustments).omit({
  id: true,
});

export type InsertBankAdjustment = z.infer<typeof insertBankAdjustmentSchema>;
export type BankAdjustment = typeof bankAdjustments.$inferSelect;

// Bank balance settings
export const bankBalance = pgTable("bank_balance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  balance: integer("balance").notNull(),
});

export const insertBankBalanceSchema = createInsertSchema(bankBalance).omit({
  id: true,
});

export type InsertBankBalance = z.infer<typeof insertBankBalanceSchema>;
export type BankBalance = typeof bankBalance.$inferSelect;
