// backend/src/routes/cases.routes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Case from "../models/Case.js";
import Client from "../models/Client.js";

const router = express.Router();

// All routes require auth
router.use(requireAuth);

/**
 * GET /api/cases
 * Optional: ?q= (search title/number)
 * Optional: ?courtType=…&courtPlace=…
 */
router.get("/", async (req, res) => {
  const q = req.query.q?.trim();
  const filter = { userId: req.userId };

  if (q) {
    filter.$or = [
      { title:   new RegExp(q, "i") },
      { number:  new RegExp(q, "i") },
    ];
  }
  if (req.query.courtType)  filter.courtType  = req.query.courtType;
  if (req.query.courtPlace) filter.courtPlace = req.query.courtPlace;

  const docs = await Case.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: "clientId", select: "name", options: { lean: true } })
    .lean();

  // Attach clientName to each case
  const items = docs.map(d => ({
    ...d,
    clientName: d.clientId?.name || null,
    clientId:   d.clientId?._id || d.clientId, // keep id
  }));

  res.json(items);
});

/**
 * POST /api/cases
 * Body: { title (req), clientId (req), number?, type?, courtType?, courtPlace?, status? }
 * Validates client belongs to the same user, then creates the case.
 */
router.post("/", async (req, res) => {
  const body = req.body || {};

  if (!body.title) return res.status(400).json({ error: "title is required" });
  if (!body.clientId) return res.status(400).json({ error: "clientId is required" });

  // Validate client ownership & get name (useful if you later denormalize)
  const client = await Client.findOne({ _id: body.clientId, userId: req.userId })
    .select("name")
    .lean();
  if (!client) return res.status(400).json({ error: "Invalid clientId" });

  const doc = await Case.create({
    ...body,
    userId: req.userId,
  });

  res.status(201).json(doc);
});

/**
 * GET /api/cases/:id
 */
router.get("/:id", async (req, res) => {
  const doc = await Case.findOne({ _id: req.params.id, userId: req.userId })
    .populate({ path: "clientId", select: "name", options: { lean: true } })
    .lean();

  if (!doc) return res.status(404).json({ error: "Not found" });

  res.json({
    ...doc,
    clientName: doc.clientId?.name || null,
    clientId:   doc.clientId?._id || doc.clientId,
  });
});

/**
 * PUT /api/cases/:id
 * If clientId is changed, re‑validate ownership.
 */
router.put("/:id", async (req, res) => {
  const update = { ...req.body };

  if (update.clientId) {
    const ok = await Client.exists({ _id: update.clientId, userId: req.userId });
    if (!ok) return res.status(400).json({ error: "Invalid clientId" });
  }

  const updated = await Case.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    update,
    { new: true }
  );

  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

/**
 * DELETE /api/cases/:id
 */
router.delete("/:id", async (req, res) => {
  const deleted = await Case.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router;
