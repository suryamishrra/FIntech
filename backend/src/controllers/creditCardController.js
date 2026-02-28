const prisma = require("../config/prisma");

// 1️⃣ Create Credit Card
exports.createCard = async (req, res, next) => {
  try {
    const { name, limit, dueDate } = req.body;

    if (!name || !limit || !dueDate) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (limit <= 0) {
      return res.status(400).json({ message: "Limit must be greater than 0" });
    }

    const card = await prisma.creditCard.create({
      data: {
        name,
        limit,
        dueDate,
        userId: req.user.userId,
      },
    });

    res.status(201).json(card);
  } catch (error) {
    next(error);
  }
};

// 2️⃣ Add Transaction (SPEND / PAYMENT)
exports.addCardTransaction = async (req, res, next) => {
  try {
    const { cardId, type, amount } = req.body;

    if (!cardId || !type || !amount) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    if (!["SPEND", "PAYMENT"].includes(type)) {
      return res.status(400).json({
        message: "Type must be SPEND or PAYMENT",
      });
    }

    const card = await prisma.creditCard.findFirst({
      where: {
        id: cardId,
        userId: req.user.userId,
      },
    });

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    let newOutstanding;

    if (type === "SPEND") {
      if (card.outstanding + amount > card.limit) {
        return res.status(400).json({
          message: "Credit limit exceeded",
        });
      }
      newOutstanding = card.outstanding + amount;
    }

    if (type === "PAYMENT") {
      if (amount > card.outstanding) {
        return res.status(400).json({
          message: "Payment exceeds outstanding amount",
        });
      }
      newOutstanding = card.outstanding - amount;
    }

    await prisma.cardTransaction.create({
      data: {
        type,
        amount,
        creditCardId: cardId,
      },
    });

    await prisma.creditCard.update({
      where: { id: cardId },
      data: { outstanding: newOutstanding },
    });

    const utilization = ((newOutstanding / card.limit) * 100).toFixed(2);

    res.json({
      message: "Transaction added",
      outstanding: newOutstanding,
      utilization: `${utilization}%`,
    });

  } catch (error) {
    next(error);
  }
};

// 3️⃣ Get All Cards
exports.getCards = async (req, res, next) => {
  try {
    const cards = await prisma.creditCard.findMany({
      where: { userId: req.user.userId },
      include: { transactions: true },
    });

    res.json(cards);
  } catch (error) {
    next(error);
  }
};