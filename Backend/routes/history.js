const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const CustomerOrder = require("../models/CustomOrder");
const Transaction = require("../models/Transaction");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      userId = req.user.id
      ,
      startDate,
      endDate,
      query,
      limit = 20,
      skip = 0,
      type,
    } = req.query;
    // console.log("Query params:", req.query);
    if (!userId ) {
      return res
        .status(401)
        .json({ message: "Unauthorized or missing userId" });
    }

    const baseFilter = { userId };
    if (startDate || endDate) {
      baseFilter.createdAt = {};
      if (startDate) baseFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // include the whole day
        baseFilter.createdAt.$lte = end;
      }
    }

    // Setup filters per collection
    const billQuery = { ...baseFilter };
    if (query) {
      const words = query.split(" ").filter(Boolean);
      const regexConditions = words.flatMap((word) => {
        const regex = new RegExp(word, "i");
        return [
          { customer_name: regex },
          { customer_phone_no: regex },
          { address: regex },
          { "items.name": regex },
          { "return_items.name": regex },
          { name: regex },
          { phone: regex },
          { ornament_name: regex },
          { weightrange: regex },
          { description: regex },
          { transaction_type: regex },
          { mode: regex },
          { category: regex },
          { source_or_destination: regex },
        ];
      });
      billQuery.$or = regexConditions;
    }

    // Fetch data sequentially
    let bills = [],
      customerOrders = [],
      transactions = [];

    if (!type || type === "bill") {
      bills = await Bill.find(billQuery).lean();
    }

    if (!type || type === "customerOrder") {
      customerOrders = await CustomerOrder.find(billQuery).lean();
    }

    if (!type || type === "transaction") {
      transactions = await Transaction.find(billQuery).lean();
    }
    // Add type labels
    const historyData = [
      ...bills.map((b) => ({ ...b, type: "bill" })),
      ...customerOrders.map((c) => ({ ...c, type: "customerOrder" })),
      ...transactions.map((t) => ({ ...t, type: "transaction" })),
    ];

    // Sort and paginate
    const sorted = historyData
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(parseInt(skip), parseInt(skip) + parseInt(limit));
   
      // console.log("Sorted data:", sorted);
    res.status(200).json({
      totalCount: historyData.length,
      data: sorted,
      cash_balance: req.user.cash_balance || 0,
      bank_balance: req.user.bank_balance || 0,
    });
  } catch (err) {
    console.error("Error in /history:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
