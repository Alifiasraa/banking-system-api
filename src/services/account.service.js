const prisma = require("../config/prisma");

const createAccount = async (data) => {
  const { user_id, bank_name, bank_account_number, balance } = data;
  return await prisma.bankAccount.create({
    data: {
      user_id,
      bank_name,
      bank_account_number,
      balance,
    },
  });
};

const getAllAccounts = async () => {
  return await prisma.bankAccount.findMany();
};

const getAccountById = async (id) => {
  return await prisma.bankAccount.findUnique({
    where: {
      id: id,
    },
    include: {
      sentTransaction: true,
      receivedTransaction: true,
    },
  });
};

const updateAccountById = async (id, reqBody) => {
  return await prisma.bankAccount.update({
    where: {
      id: id,
    },
    data: reqBody,
  });
};

const deleteAccountById = async (id) => {
  return await prisma.bankAccount.delete({
    where: {
      id: id,
    },
  });
};

const validateInput = async (body) => {
  if (!body.user_id) {
    return { status: "Bad Request", message: "User ID is required" };
  }

  if (!body.bank_name) {
    return { status: "Bad Request", message: "Bank name is required" };
  }

  if (!body.bank_account_number) {
    return {
      status: "Bad Request",
      message: "Bank account number is required",
    };
  }

  if (typeof body.balance !== "number") {
    return {
      status: "Bad Request",
      message: "Balance must be a number",
    };
  }

  if (body.balance < 0) {
    return {
      status: "Bad Request",
      message: "Balance must be a non-negative number",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: body.user_id },
  });

  if (!user) {
    return { status: "Bad Request", message: "User ID does not exist" };
  }

  const accountNumber = await prisma.bankAccount.findUnique({
    where: { bank_account_number: body.bank_account_number },
  });

  if (accountNumber) {
    return {
      status: "Bad Request",
      message: "Bank account number is already in use",
    };
  }

  return {
    status: "success",
    message: "Input is valid",
  };
};

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccountById,
  deleteAccountById,
  validateInput,
};
