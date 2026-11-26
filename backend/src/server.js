import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Transaction from "./models/Transaction.js";
import transactionRoutes from "./routes/transactions.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : true
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "FinTrack API is running" });
});

app.use("/api/transactions", transactionRoutes);

app.get("/api/summary", async (_req, res, next) => {
  try {
    const transactions = await Transaction.find();
    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const expenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const categoryTotals = {};
    transactions.filter((item) => item.type === "expense").forEach((item) => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    });

    const now = new Date();
    const monthIncome = transactions
      .filter((item) => item.type === "income" && item.date.getMonth() === now.getMonth() && item.date.getFullYear() === now.getFullYear())
      .reduce((sum, item) => sum + item.amount, 0);
    const monthExpenses = transactions
      .filter((item) => item.type === "expense" && item.date.getMonth() === now.getMonth() && item.date.getFullYear() === now.getFullYear())
      .reduce((sum, item) => sum + item.amount, 0);

    res.json({
      income,
      expenses,
      balance: income - expenses,
      monthIncome,
      monthExpenses,
      categoryTotals
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Something went wrong on the server." });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
