const prisma = require("../config/prisma");
const { generateRiskReport } = require("../services/ruleEngine");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🔥 Simple 5-minute in-memory cache
const cache = new Map();

exports.analyzeFinance = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const cacheKey = `finance-${userId}`;
    const cached = cache.get(cacheKey);

    // ✅ Return cached response if within 5 minutes
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return res.json(cached.data);
    }

    const now = new Date();

    // ===== CURRENT MONTH RANGE =====
    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // ===== PREVIOUS MONTH RANGE =====
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );

    // ===== FETCH CURRENT MONTH EXPENSES =====
    const currentMonthExpensesData = await prisma.expense.findMany({
      where: {
        userId,
        createdAt: {
          gte: currentMonthStart,
        },
      },
    });

    const currentMonthExpenses = currentMonthExpensesData.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );

    // ===== FETCH PREVIOUS MONTH EXPENSES =====
    const previousMonthExpensesData = await prisma.expense.findMany({
      where: {
        userId,
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
    });

    const previousMonthExpenses = previousMonthExpensesData.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );

    // ===== BANK DATA =====
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { userId },
    });

    const totalBankBalance = bankAccounts.reduce(
      (sum, acc) => sum + acc.balance,
      0
    );

    // ===== CREDIT DATA =====
    const creditCards = await prisma.creditCard.findMany({
      where: { userId },
    });

    const totalCreditOutstanding = creditCards.reduce(
      (sum, card) => sum + card.outstanding,
      0
    );

    const totalCreditLimit = creditCards.reduce(
      (sum, card) => sum + card.limit,
      0
    );

    const netWorth = totalBankBalance - totalCreditOutstanding;

    // ===== BUDGET DATA =====
    const budget = await prisma.budget.findFirst({
      where: { userId },
    });

    const budgetLimit = budget ? budget.amount : null;

    // ===== RULE ENGINE =====
    const riskReport = generateRiskReport({
      totalBankBalance,
      totalCreditOutstanding,
      totalCreditLimit,
      netWorth,
      recentExpenses: currentMonthExpenses,
      previousMonthExpenses,
      budgetLimit,
    });

    // ===== GEMINI MODEL =====
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a personal finance coach.

Respond STRICTLY in valid JSON format only.

Return this structure:
{
  "summary": "...simple explanation in 3-4 lines...",
  "whatThisMeans": "...why this matters practically...",
  "actionSteps": [
    "...clear step 1...",
    "...clear step 2...",
    "...clear step 3..."
  ],
  "quickWins": [
    "...easy action 1...",
    "...easy action 2..."
  ]
}

Keep language simple and practical.
No financial jargon.

System Risk Report:
Risk Score: ${riskReport.riskScore}
Risk Level: ${riskReport.riskLevel}
Alerts: ${riskReport.alerts.join(", ")}

Financial Metrics:
Current Month Expenses: ${currentMonthExpenses}
Previous Month Expenses: ${previousMonthExpenses}
Net Worth: ${netWorth}
Credit Outstanding: ${totalCreditOutstanding}
Credit Limit: ${totalCreditLimit}
Budget Limit: ${budgetLimit}
`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // 🔥 Safe JSON extraction
    let structuredResponse;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      structuredResponse = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { raw: rawText };
    } catch {
      structuredResponse = { raw: rawText };
    }

    const finalResponse = {
      ruleEngine: riskReport,
      aiInsights: structuredResponse,
    };

    // ✅ Save to cache
    cache.set(cacheKey, {
      timestamp: Date.now(),
      data: finalResponse,
    });

    res.json(finalResponse);

  } catch (error) {
    console.error("AI ERROR:", error);

    // 🔥 AI fallback safe mode
    res.status(200).json({
      ruleEngine: {
        riskScore: 0,
        riskLevel: "Unknown",
        alerts: ["AI service temporarily unavailable"],
      },
      aiInsights: {
        summary: "AI insights currently unavailable.",
        whatThisMeans:
          "System rule engine calculated your financial status, but AI advice is temporarily down.",
        actionSteps: [],
        quickWins: [],
      },
    });
  }
};