const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");

const {
  createCard,
  addCardTransaction,
  getCards,
} = require("../controllers/creditCardController");

router.post("/", authMiddleware, createCard);
router.post("/transaction", authMiddleware, addCardTransaction);
router.get("/", authMiddleware, getCards);

module.exports = router;