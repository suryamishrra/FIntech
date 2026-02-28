const express = require('express');
const router = express.Router();

const authRoutes = require("./authRoutes");
const expenseRoutes = require("./expenseRoutes");
const budgetRoutes = require("./budgetRoutes");
const bankRoutes = require("./bankRoutes");
const creditCardRoutes = require("./creditCardRoutes");
const financeRoutes = require("./financeRoutes");

// Health route
router.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running smoothly!',
    database: 'SQLite configured'
  });
});

// Auth routes
router.use("/auth", authRoutes);

//Budget routes
router.use("/budgets", budgetRoutes);

// Expense routes
router.use("/expenses", expenseRoutes);

//Bank routes
router.use("/accounts", bankRoutes);

//Credit Card routes
router.use("/cards", creditCardRoutes);

//Finance summary routes
router.use("/finance", financeRoutes);

module.exports = router;