const accountService = require("../services/account.service");

const createAccount = async (req, res) => {
  try {
    const input = await accountService.validateInput(req.body);
    if (input.status === "Bad Request") {
      return res.status(400).json({
        status: "error",
        message: input.message,
      });
    }

    const account = await accountService.createAccount(req.body);
    res.status(201).json({
      status: "success",
      message: "Account created successfully",
      account: account,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getAllAccounts = async (req, res) => {
  try {
    const accounts = await accountService.getAllAccounts();
    res.status(200).json({
      status: "success",
      message: "Accounts retrieved successfully",
      accounts: accounts,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await accountService.getAccountById(id);
    if (!account) {
      return res.status(404).json({
        status: "error",
        message: "Account not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Account retrieved successfully",
      account: account,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const updateAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAccount = await accountService.getAccountById(id);
    if (!existingAccount) {
      return res.status(404).json({
        status: "error",
        message: "Account not found",
      });
    }

    const account = await accountService.updateAccountById(id, req.body);
    res.status(200).json({
      status: "success",
      message: "Account updated successfully",
      account: account,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const deleteAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    const existingAccount = await accountService.getAccountById(id);
    if (!existingAccount) {
      return res.status(404).json({
        status: "error",
        message: "Account not found",
      });
    }

    await accountService.deleteAccountById(id);
    res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccountById,
  deleteAccountById,
};
