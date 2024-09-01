const { Router } = require("express");
const transactionController = require("../controllers/transaction.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

router.post("/", authMiddleware, transactionController.createTransaction);
router.get("/", authMiddleware, transactionController.getAllTransactions);
router.get("/:id", authMiddleware, transactionController.getTransactionById);
router.delete(
  "/:id",
  authMiddleware,
  transactionController.deleteTransactionById
);

module.exports = router;
