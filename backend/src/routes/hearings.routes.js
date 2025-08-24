import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Hearing from "../models/Hearing.js";
import Case from "../models/Case.js";

const router = express.Router();

// All hearings routes require auth
router.use(requireAuth);

/**
 * GET /api/hearings
 * List all hearings for the current user (optionally by caseId, and/or upcoming only)
 * Query: ?caseId=...&from=ISO&to=ISO
 */
router.get("/", async (req, res) => {
  const { caseId, from, to } = req.query;

  const filter = { userId: req.userId };
  if (caseId) filter.caseId = caseId;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const items = await Hearing.find(filter)
    .sort({ date: 1 })
    .limit(200)
    .lean();

  res.json(items);
});

/**
 * POST /api/hearings
 * Body: { caseId, date, venue?, notes?, outcome? }
 */
router.post("/", async (req, res) => {
  const body = req.body || {};

  // Validate the case belongs to this user
  const kase = await Case.findOne({ _id: body.caseId, userId: req.userId });
  if (!kase) return res.status(400).json({ error: "Invalid caseId" });

  const doc = await Hearing.create({
    ...body,
    userId: req.userId,
  });

  res.status(201).json(doc);
});

/**
 * GET /api/hearings/:id
 */
router.get("/:id", async (req, res) => {
  const doc = await Hearing.findOne({ _id: req.params.id, userId: req.userId }).lean();
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});

/**
 * PUT /api/hearings/:id
 */
router.put("/:id", async (req, res) => {
  // If caseId is changing, validate ownership
  if (req.body?.caseId) {
    const ok = await Case.exists({ _id: req.body.caseId, userId: req.userId });
    if (!ok) return res.status(400).json({ error: "Invalid caseId" });
  }

  const updated = await Hearing.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

/**
 * DELETE /api/hearings/:id
 */
router.delete("/:id", async (req, res) => {
  const deleted = await Hearing.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router; // 👈 IMPORTANT
