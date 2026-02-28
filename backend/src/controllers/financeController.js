const prisma = require("../config/prisma");

exports.getFinanceSummary = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Fetch bank accounts
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { userId },
    });

    // Fetch credit cards
    const creditCards = await prisma.creditCard.findMany({
      where: { userId },
    });

    // Calculate totals
    const totalBankBalance = bankAccounts.reduce(
      (sum, account) => sum + account.balance,
      0
    );

    const totalCreditOutstanding = creditCards.reduce(
      (sum, card) => sum + card.outstanding,
      0
    );

    const totalCreditLimit = creditCards.reduce(
      (sum, card) => sum + card.limit,
      0
    );

    const netWorth = totalBankBalance - totalCreditOutstanding;

    const creditUtilization =
      totalCreditLimit === 0
        ? 0
        : ((totalCreditOutstanding / totalCreditLimit) * 100).toFixed(2);

    res.json({
      totalBankBalance,
      totalCreditOutstanding,
      totalCreditLimit,
      netWorth,
      creditUtilization: `${creditUtilization}%`,
    });

  } catch (error) {
    next(error);
  }
};