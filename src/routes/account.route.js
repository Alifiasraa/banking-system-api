const { Router } = require("express");
const accountController = require("../controllers/account.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

router.post("/", authMiddleware, accountController.createAccount);
router.get("/", authMiddleware, accountController.getAllAccounts);
router.get("/:id", authMiddleware, accountController.getAccountById);
router.put("/:id", authMiddleware, accountController.updateAccountById);
router.delete("/:id", authMiddleware, accountController.deleteAccountById);

module.exports = router;
