const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ["customized", "ready-made"] },
  weight: Number,
  purity: Number,
  rate: Number,
  making_charges: { type: Number, default: 0 },
  price: Number,
});

const returnItemSchema = new mongoose.Schema({
  name: String,
  weight: Number,
  purity: Number,
  type: { type: String, enum: ["gold", "silver"] },
  rate: Number,
  return_price: Number,
});

const billSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer_name: String,
    customer_phone_no: String,
    address: String,
    earlier_deposited_amount: { type: Number, default: 0 },
    items: [itemSchema],
    return_items: [returnItemSchema],
    amount: Number,
    payment_mode: { type: String, enum: ["cash", "UPI"] },
    amount_paid: Number,
    payment_status: { type: String, enum: ["paid", "unpaid", "partial"] },
    payment_remaining: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bill", billSchema);
