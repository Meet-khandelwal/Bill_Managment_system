const express = require("express");
const mongoose = require("mongoose");
const CustomerOrder = require("../models/CustomOrder");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

const isValidPhone = (phone) => /^\d{10}$/.test(phone);

// --- Create Order ---
router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      ornament_name,
      weightrange,
      rate,
      description,
      amountPrepaid = 0,
      paymentType,
      expectedCompletionTime,
      budget,
    } = req.body;

    if (!isValidPhone(phone))
      return res.status(400).json({ message: "Invalid phone number" });
    if (amountPrepaid < 0)
      return res
        .status(400)
        .json({ message: "amountPrepaid must be positive" });
    if (paymentType && !["cash", "UPI"].includes(paymentType))
      return res.status(400).json({ message: "Invalid paymentType" });

    const order = new CustomerOrder({
      userId: req.user._id,
      name,
      phone,
      address,
      ornament_name,
      weightrange,
      rate,
      description,
      amountPrepaid,
      paymentType,
      expectedCompletionTime,
      budget,
    });

    await order.save();

    // Balance Adjustment
    if (amountPrepaid) {
      if (paymentType === "cash") req.user.cash_balance += Number(amountPrepaid);
      else if (paymentType === "UPI") req.user.bank_balance += Number(amountPrepaid);
      await req.user.save();
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- Update Order ---
router.put("/:id", auth, async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const oldAmount = order.amountPrepaid || 0;
    const oldType = order.paymentType;

    const {
      name,
      phone,
      address,
      ornament_name,
      weightrange,
      rate,
      description,
      amountPrepaid = oldAmount,
      paymentType = oldType,
      expectedCompletionTime,
      budget,
    } = req.body;

    if (!isValidPhone(phone))
      return res.status(400).json({ message: "Invalid phone number" });
    if (amountPrepaid < 0)
      return res
        .status(400)
        .json({ message: "amountPrepaid must be positive" });

    // Revert old balance
    if (oldAmount) {
      if (oldType === "cash") req.user.cash_balance -= oldAmount;
      else if (oldType === "UPI") req.user.bank_balance -= oldAmount;
    }

    // Assign updates
    Object.assign(order, {
      name,
      phone,
      address,
      ornament_name,
      weightrange,
      rate,
      description,
      amountPrepaid,
      paymentType,
      expectedCompletionTime,
      budget,
    });

    await order.save();

    // Apply new balance adjustment
    if (amountPrepaid) {
      if (paymentType === "cash") req.user.cash_balance += Number(amountPrepaid);
      else if (paymentType === "UPI") req.user.bank_balance += Number(amountPrepaid);
    }

    await req.user.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- Delete Order ---
router.delete("/:id", auth, async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.amountPrepaid) {
      if (order.paymentType === "cash")
        req.user.cash_balance -= Number(order.amountPrepaid);
      else if (order.paymentType === "UPI")
        req.user.bank_balance -= Number(order.amountPrepaid);
      await req.user.save();
    }

    await order.deleteOne();
    console.log("Order deleted successfully");
    res.json({
      message: "Order deleted successfully",
      cash_balance: req.user.cash_balance,
      bank_balance: req.user.bank_balance,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
