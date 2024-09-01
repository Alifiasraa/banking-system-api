const { Router } = require("express");
const userRouter = require("./user.route");
const accountRouter = require("./account.route");
const transactionRouter = require("./transaction.route");
const userController = require("../controllers/user.controller");

const router = Router();

// auth
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

router.use("/users", userRouter);
router.use("/accounts", accountRouter);
router.use("/transactions", transactionRouter);

module.exports = router;
