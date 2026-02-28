const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const { getFinanceSummary } = require("../controllers/financeController");

router.get("/summary", authMiddleware, getFinanceSummary);

module.exports = router;