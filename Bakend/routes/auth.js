const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// POST /signup
router.post("/signup", async (req, res) => {
  const { username, email, password, cash_balance = 0, bank_balance = 0} = req.body;
  // 
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      cash_balance: parseFloat(cash_balance),
      bank_balance: parseFloat(bank_balance),
    });
    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      token,
      user: {
        id: newUser._id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
    })

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Wrong Password" });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
