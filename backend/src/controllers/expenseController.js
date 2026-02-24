const prisma = require("../config/prisma");

// Add Expense
exports.addExpense = async (req, res, next) => {
  try {
    const { amount, category, note } = req.body;

    if (!amount || amount <= 0) {
  return res.status(400).json({ message: "Amount must be greater than 0" });
}

if (!category || category.trim() === "") {
  return res.status(400).json({ message: "Category is required" });
}

    if (!amount || !category) {
      return res.status(400).json({ message: "Amount and category required" });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        category,
        note,
        userId: req.user.userId, // coming from JWT middleware
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

// Get All Expenses (User Specific)
exports.getExpenses = async (req, res, next) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

// Delete Expense (Secure Version)
exports.deleteExpense = async (req, res, next) => {
  try {
    const expenseId = parseInt(req.params.id);

    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: req.user.userId
      }
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await prisma.expense.delete({
      where: { id: expenseId }
    });

    res.json({ message: "Expense deleted successfully" });

  } catch (error) {
    next(error);
  }
};