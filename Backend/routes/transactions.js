const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/authMiddleware");

const adjustBalance = async (user, amount, mode, type) => {
  const adj = type === "inflow" ? amount : -amount;
  if (mode === "cash") user.cash_balance += adj;
  else if (mode === "UPI") user.bank_balance += adj;
  await user.save();
};

const revertBalance = async (user, transaction) => {
  const reverseType =
    transaction.transaction_type === "inflow" ? "outflow" : "inflow";
  await adjustBalance(user, Number(transaction.amount), transaction.mode, reverseType);
};

// POST /transactions
router.post("/", auth, async (req, res) => {
  try {
    const {
      amount,
      description,
      transaction_type,
      mode,
      category,
      source_or_destination,
    } = req.body;

    // Validation
    if (!["inflow", "outflow"].includes(transaction_type))
      return res.status(400).json({ message: "Invalid transaction_type" });
    if (!["cash", "UPI"].includes(mode))
      return res.status(400).json({ message: "Invalid mode" });
    if (!["in-house", "invoice"].includes(category))
      return res.status(400).json({ message: "Invalid category" });
    if (amount <= 0)
      return res.status(400).json({ message: "Amount must be positive" });
    if (!description || !source_or_destination)
      return res
        .status(400)
        .json({ message: "Description and source_or_destination required" });

    const transaction = new Transaction({
      userId: req.user._id,
      amount,
      description,
      transaction_type,
      mode,
      category,
      source_or_destination,
    });

    await adjustBalance(req.user, Number(amount), mode, transaction_type);
    await transaction.save();

    res.status(201).json(transaction);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating transaction", error: err.message });
  }
});

// PUT /transactions/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const existing = await Transaction.findById(req.params.id);
    if (!existing || !existing.userId.equals(req.user._id)) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await revertBalance(req.user, existing); // revert old

    // New values
    const {
      amount,
      description,
      transaction_type,
      mode,
      category,
      source_or_destination,
    } = req.body;

    // Validation
    if (!["inflow", "outflow"].includes(transaction_type))
      return res.status(400).json({ message: "Invalid transaction_type" });
    if (!["cash", "UPI"].includes(mode))
      return res.status(400).json({ message: "Invalid mode" });
    if (!["in-house", "invoice"].includes(category))
      return res.status(400).json({ message: "Invalid category" });
    if (amount <= 0)
      return res.status(400).json({ message: "Amount must be positive" });

    Object.assign(existing, {
      amount,
      description,
      transaction_type,
      mode,
      category,
      source_or_destination,
    });

    await adjustBalance(req.user, Number(amount), mode, transaction_type);
    await existing.save();

    res.json(existing);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating transaction", error: err.message });
  }
});

// DELETE /transactions/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction || !transaction.userId.equals(req.user._id)) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await revertBalance(req.user, transaction);
    await transaction.deleteOne();
    console.log("Transaction deleted:", transaction);
    res.json({
      message: "Transaction deleted and balance reverted",
      cash_balance: req.user.cash_balance,
      bank_balance: req.user.bank_balance,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting transaction", error: err.message });
  }
});

module.exports = router;
