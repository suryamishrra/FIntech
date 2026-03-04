const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/authMiddleware");
const { analyzeFinance } = require("../controllers/aiController");

// Hybrid AI Analysis Route
router.post("/analyze", authMiddleware, analyzeFinance);

module.exports = router;