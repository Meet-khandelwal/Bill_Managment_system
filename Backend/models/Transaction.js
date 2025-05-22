const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    transaction_type: {
      type: String,
      enum: ["inflow", "outflow"],
      required: true,
    },
    mode: { type: String, enum: ["cash", "UPI"], required: true },
    category: { type: String, enum: ["in-house", "invoice"], required: true },
    source_or_destination: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
