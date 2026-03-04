exports.generateRiskReport = ({
  totalBankBalance,
  totalCreditOutstanding,
  totalCreditLimit,
  netWorth,
  recentExpenses,
  previousMonthExpenses,
  budgetLimit,
}) => {

  const alerts = [];
  let riskScore = 100;

  // ===== 1️⃣ Net Worth Rule =====
  if (netWorth < 0) {
    alerts.push("Net worth is negative. You owe more than you own.");
    riskScore -= 25;
  }

  // ===== 2️⃣ Credit Utilization Rule =====
  const creditUtilization =
    totalCreditLimit === 0
      ? 0
      : (totalCreditOutstanding / totalCreditLimit) * 100;

  if (creditUtilization > 70) {
    alerts.push("Credit utilization above 70%. High financial risk.");
    riskScore -= 25;
  } else if (creditUtilization > 30) {
    alerts.push("Credit utilization above 30%. Moderate risk.");
    riskScore -= 15;
  }

  // ===== 3️⃣ Expense Growth Rule =====
  if (previousMonthExpenses > 0) {
    const expenseGrowth =
      ((recentExpenses - previousMonthExpenses) /
        previousMonthExpenses) *
      100;

    if (expenseGrowth > 20) {
      alerts.push(
        `Expenses increased by ${expenseGrowth.toFixed(
          2
        )}% compared to last month.`
      );
      riskScore -= 15;
    }
  }

  // ===== 4️⃣ Emergency Fund Rule =====
  if (recentExpenses > 0 && totalBankBalance < recentExpenses * 3) {
    alerts.push(
      "Emergency fund is below 3x monthly expenses."
    );
    riskScore -= 20;
  }

  // ===== 5️⃣ Budget Breach Rule =====
  if (budgetLimit && recentExpenses > budgetLimit) {
    alerts.push(
      "Monthly expenses exceeded allocated budget."
    );
    riskScore -= 20;
  }

  // Clamp score
  if (riskScore < 0) riskScore = 0;

  let riskLevel = "Low";

  if (riskScore < 40) {
    riskLevel = "High";
  } else if (riskScore < 70) {
    riskLevel = "Moderate";
  }

  return {
    riskScore,
    riskLevel,
    alerts,
  };
};