const express = require("express");
const router = express.Router();

const {
  addExpense,
  getExpenses,
  deleteExpense,
} = require("../controllers/expenseController");

const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, addExpense);
router.get("/", authMiddleware, getExpenses);
router.delete("/:id", authMiddleware, deleteExpense);

module.exports = router;