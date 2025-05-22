const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const billRoutes = require("./routes/bills");
const customerOrderRoutes = require("./routes/customOrders");
const transactionRoutes = require("./routes/transactions");
const historyRoutes = require("./routes/history");


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/customOrders", customerOrderRoutes);
app.use("/api/customerOrders", customerOrderRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/history", historyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
