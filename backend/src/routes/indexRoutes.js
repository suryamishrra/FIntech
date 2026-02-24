const express = require('express');
const router = express.Router();

const authRoutes = require("./authRoutes");
const expenseRoutes = require("./expenseRoutes");

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

// Expense routes
router.use("/expenses", expenseRoutes);

module.exports = router;