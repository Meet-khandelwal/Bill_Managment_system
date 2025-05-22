const mongoose = require("mongoose");

const customerOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    ornament_name: { type: String, required: true },
    weightrange: { type: String, required: true },
    rate: Number,
    description: String,
    amountPrepaid: Number,
    paymentType: { type: String, enum: ["cash", "UPI"] },
    expectedCompletionTime: { type: Date, required: true },
    budget: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CustomerOrder", customerOrderSchema);
