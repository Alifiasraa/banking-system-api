const transactionService = require("../services/transaction.service");

const createTransaction = async (req, res) => {
  try {
    const input = await transactionService.validateInput(req.body);
    if (input.status === "Bad Request") {
      return res.status(400).json({
        status: "error",
        message: input.message,
      });
    }

    const transaction = await transactionService.createTransaction(req.body);
    res.status(201).json({
      status: "success",
      message: "Transaction created successfully",
      transaction: transaction,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransaction();
    res.status(200).json({
      status: "success",
      message: "Transactions retrieved successfully",
      transactions: transactions,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.getTransactionById(id);
    if (!transaction) {
      return res.status(404).json({
        status: "error",
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Transaction retrieved successfully",
      transaction: transaction,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const deleteTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.getTransactionById(id);
    if (!transaction) {
      return res.status(404).json({
        status: "error",
        message: "Transaction not found",
      });
    }

    await transactionService.deleteTransactionById(id);
    res.status(200).json({
      status: "success",
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  deleteTransactionById,
};
