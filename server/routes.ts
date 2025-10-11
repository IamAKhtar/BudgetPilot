import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCommitmentSchema, insertBankBalanceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all commitments
  app.get("/api/commitments", async (req, res) => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const commitments = await storage.getCommitments(month, year);
      res.json(commitments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch commitments" });
    }
  });

  // Get single commitment
  app.get("/api/commitments/:id", async (req, res) => {
    try {
      const commitment = await storage.getCommitment(req.params.id);
      if (!commitment) {
        return res.status(404).json({ error: "Commitment not found" });
      }
      res.json(commitment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch commitment" });
    }
  });

  // Create commitment
  app.post("/api/commitments", async (req, res) => {
    try {
      const validated = insertCommitmentSchema.parse(req.body);
      const commitment = await storage.createCommitment(validated);
      res.status(201).json(commitment);
    } catch (error) {
      res.status(400).json({ error: "Invalid commitment data" });
    }
  });

  // Update commitment
  app.patch("/api/commitments/:id", async (req, res) => {
    try {
      const validated = insertCommitmentSchema.parse(req.body);
      const commitment = await storage.updateCommitment(req.params.id, validated);
      if (!commitment) {
        return res.status(404).json({ error: "Commitment not found" });
      }
      res.json(commitment);
    } catch (error) {
      res.status(400).json({ error: "Invalid commitment data" });
    }
  });

  // Delete commitment
  app.delete("/api/commitments/:id", async (req, res) => {
    try {
      const success = await storage.deleteCommitment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Commitment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete commitment" });
    }
  });

  // Copy commitments from previous month
  app.post("/api/commitments/copy-from-previous", async (req, res) => {
    try {
      const { month, year } = req.body;
      
      if (!month || !year) {
        return res.status(400).json({ error: "Month and year are required" });
      }

      // Calculate previous month
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear = year - 1;
      }

      // Get commitments from previous month
      const previousCommitments = await storage.getCommitments(prevMonth, prevYear);
      
      if (previousCommitments.length === 0) {
        return res.status(404).json({ error: "No commitments found in previous month" });
      }

      // Copy commitments to new month with doneSoFar = 0
      const copiedCommitments = await Promise.all(
        previousCommitments.map(commitment =>
          storage.createCommitment({
            type: commitment.type,
            name: commitment.name,
            monthlyCommitment: commitment.monthlyCommitment,
            doneSoFar: 0,
            balance: commitment.monthlyCommitment,
            dueDay: commitment.dueDay,
            isAutomated: commitment.isAutomated,
            month,
            year,
          })
        )
      );

      res.status(201).json(copiedCommitments);
    } catch (error) {
      res.status(500).json({ error: "Failed to copy commitments" });
    }
  });

  // Get bank balance
  app.get("/api/bank-balance", async (req, res) => {
    try {
      const balance = await storage.getBankBalance();
      res.json(balance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bank balance" });
    }
  });

  // Adjust bank balance
  app.post("/api/bank-balance/adjust", async (req, res) => {
    try {
      const { balance, reason } = req.body;
      
      if (typeof balance !== 'number' || !reason) {
        return res.status(400).json({ error: "Invalid data" });
      }

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Create adjustment record
      await storage.createBankAdjustment({
        amount: balance,
        reason,
        timestamp: now.toISOString(),
        month,
        year,
      });

      // Update balance
      const updated = await storage.updateBankBalance({ balance });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Failed to update bank balance" });
    }
  });

  // Get bank adjustments history
  app.get("/api/bank-adjustments", async (req, res) => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const adjustments = await storage.getBankAdjustments(month, year);
      res.json(adjustments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch adjustments" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
