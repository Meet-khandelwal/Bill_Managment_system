const express = require("express");
const mongoose = require("mongoose");
const Bill = require("../models/Bill");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Validation helpers
const isValidPhone = (phone) => /^\d{10}$/.test(phone);

// --- Create Bill ---
router.post("/", auth, async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone_no,
      address,
      earlier_deposited_amount = 0,
      items,
      return_items,
      amount,
      payment_mode,
      amount_paid,
      payment_status,
    } = req.body;
    
    console.log("Received phone number:", customer_phone_no);
    console.log("payment mode:", payment_mode);
    if (!isValidPhone(customer_phone_no)) {
        console.log(err)
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const payment_remaining = Number(amount) - Number(amount_paid );
    console.log("Payment remaining:", payment_remaining);
    

    const bill = new Bill({
      userId: req.user._id,
      customer_name,
      customer_phone_no,
      address,
      earlier_deposited_amount,
      items,
      return_items,
      amount,
      payment_mode,
      amount_paid,
      payment_status,
      payment_remaining,
    });

    await bill.save();
       console.log(typeof req.user.cash_balance);
    console.log(typeof amount_paid);
    // Adjust balances
    //amount_paid = Number(amount_paid); error assignment to constant variavle
    if (payment_mode === "cash") {
      req.user.cash_balance += Number(amount_paid);

    } else if (payment_mode === "UPI") {
      req.user.bank_balance += Number(amount_paid);
    }

    await req.user.save();

    res.status(201).json(bill);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- Update Bill ---
router.put("/:id", auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // Revert old balances
    if (bill.payment_mode === "cash") {
      req.user.cash_balance -=Number(bill.amount_paid);
    } else if (bill.payment_mode === "UPI") {
      req.user.bank_balance -= Number(bill.amount_paid);
    }

    const {
      customer_name,
      customer_phone_no,
      address,
      earlier_deposited_amount = 0,
      items,
      return_items,
      amount,
      payment_mode,
      amount_paid,
      payment_status,
    } = req.body;

    const payment_remaining = amount - amount_paid;

    // Update bill fields
    Object.assign(bill, {
      customer_name,
      customer_phone_no,
      address,
      earlier_deposited_amount,
      items,
      return_items,
      amount,
      payment_mode,
      amount_paid,
      payment_status,
      payment_remaining,
    });

    await bill.save();

    // Adjust new balances
    if (payment_mode === "cash") {
      req.user.cash_balance += Number(amount_paid);
    } else if (payment_mode === "UPI") {
      req.user.bank_balance += Number(amount_paid);
    }

    await req.user.save();

    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --- Delete Bill ---
router.delete("/:id", auth, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // Revert balance
    if (bill.payment_mode === "cash") {
      req.user.cash_balance -= Number(bill.amount_paid);
    } else if (bill.payment_mode === "UPI") {
      req.user.bank_balance -= Number(bill.amount_paid);
    }

    await req.user.save();
    await bill.deleteOne();
    console.log("Bill deleted successfully");
    res.json({
      message: "Bill deleted successfully",
      cash_balance: req.user.cash_balance,
      bank_balance: req.user.bank_balance,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
