import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 80
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"]
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    note: {
      type: String,
      trim: true,
      maxlength: 250,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
