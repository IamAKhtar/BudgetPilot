import express, { type Request, Response, NextFunction } from "express";
import { storage } from "../server/storage.js";
import { insertCommitmentSchema, insertBankBalanceSchema } from "../shared/schema.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/commitments", async (req, res) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const commitments = await storage.getCommitments(month, year);
    res.json(commitments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch commitments" });
  }
});

app.get("/commitments/:id", async (req, res) => {
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

app.post("/commitments", async (req, res) => {
  try {
    const validated = insertCommitmentSchema.parse(req.body);
    const commitment = await storage.createCommitment(validated);
    res.status(201).json(commitment);
  } catch (error) {
    res.status(400).json({ error: "Invalid commitment data" });
  }
});

app.patch("/commitments/:id", async (req, res) => {
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

app.delete("/commitments/:id", async (req, res) => {
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

app.post("/commitments/copy-from-previous", async (req, res) => {
  try {
    const { month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required" });
    }

    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const previousCommitments = await storage.getCommitments(prevMonth, prevYear);
    
    if (previousCommitments.length === 0) {
      return res.status(404).json({ error: "No commitments found in previous month" });
    }

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

app.get("/bank-balance", async (req, res) => {
  try {
    const balance = await storage.getBankBalance();
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bank balance" });
  }
});

app.post("/bank-balance/adjust", async (req, res) => {
  try {
    const validated = insertBankBalanceSchema.parse({ balance: req.body.balance });
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: "Reason is required" });
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    await storage.createBankAdjustment({
      amount: validated.balance,
      reason,
      timestamp: now.toISOString(),
      month,
      year,
    });

    const updated = await storage.updateBankBalance(validated);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Failed to update bank balance" });
  }
});

app.get("/bank-adjustments", async (req, res) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const adjustments = await storage.getBankAdjustments(month, year);
    res.json(adjustments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch adjustments" });
  }
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default app;
