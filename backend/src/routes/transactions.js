import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { type, search } = req.query;
    const filter = {};
    if (type && ["income", "expense"].includes(type)) filter.type = type;
    if (search) filter.title = { $regex: search, $options: "i" };
    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, amount, type, category, date, note } = req.body;
    if (!title || !category || !["income", "expense"].includes(type) || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Please provide a title, valid amount, type and category." });
    }
    const transaction = await Transaction.create({
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date: date || new Date(),
      note: note || ""
    });
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid transaction ID." });
    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: "Transaction not found." });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid transaction ID." });
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Transaction not found." });
    res.json({ message: "Transaction deleted successfully." });
  } catch (error) {
    next(error);
  }
});

export default router;
