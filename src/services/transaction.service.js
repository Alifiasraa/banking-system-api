const prisma = require("../config/prisma");

// const createTransaction = async (data) => {
//   const { source_account_id, destination_account_id, amount } = data;
//   return await prisma.transaction.create({
//     data: {
//       source_account_id,
//       destination_account_id,
//       amount,
//     },
//     include: {
//       sourceAccount: true,
//       destinationAccount: true,
//     },
//   });
// };

const createTransaction = async (data) => {
  const { source_account_id, destination_account_id, amount } = data;

  return await prisma.$transaction(async (prisma) => {
    // 1. Kurangi saldo dari akun sumber
    await prisma.bankAccount.update({
      where: { id: source_account_id },
      data: {
        balance: {
          decrement: amount, // Kurangi saldo sesuai nominal
        },
      },
    });

    // 2. Tambahkan saldo ke akun tujuan
    await prisma.bankAccount.update({
      where: { id: destination_account_id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    const transaction = await prisma.transaction.create({
      data: {
        source_account_id,
        destination_account_id,
        amount,
      },
      include: {
        sourceAccount: true,
        destinationAccount: true,
      },
    });

    return transaction;
  });
};

const getAllTransaction = async () => {
  return await prisma.transaction.findMany();
};

const getTransactionById = async (id) => {
  return await prisma.transaction.findUnique({
    where: {
      id: id,
    },
    include: {
      sourceAccount: {
        select: {
          bank_name: true,
          bank_account_number: true,
        },
      },
      destinationAccount: {
        select: {
          bank_name: true,
          bank_account_number: true,
        },
      },
    },
  });
};

const deleteTransactionById = async (id) => {
  return await prisma.transaction.delete({
    where: {
      id: id,
    },
  });
};

const validateInput = async (body) => {
  const { source_account_id, destination_account_id, amount } = body;

  if (!source_account_id) {
    return { status: "Bad Request", message: "Source account ID is required" };
  }

  if (!destination_account_id) {
    return {
      status: "Bad Request",
      message: "Destination account ID is required",
    };
  }

  if (!amount) {
    return {
      status: "Bad Request",
      message: "Amount is required",
    };
  }

  if (typeof amount !== "number") {
    return {
      status: "Bad Request",
      message: "Transaction amount must be a number",
    };
  }

  if (amount <= 0) {
    return {
      status: "Bad Request",
      message: "Transaction amount must be greater than 0",
    };
  }

  if (source_account_id === destination_account_id) {
    return {
      status: "Bad Request",
      message: "Source and destination account cannot be the same",
    };
  }

  const sourceAccount = await prisma.bankAccount.findUnique({
    where: { id: source_account_id },
  });

  if (!sourceAccount) {
    return {
      status: "Bad Request",
      message: "Source account does not exist",
    };
  }

  const destinationAccount = await prisma.bankAccount.findUnique({
    where: { id: destination_account_id },
  });

  if (!destinationAccount) {
    return {
      status: "Bad Request",
      message: "Destination account does not exist",
    };
  }

  if (sourceAccount.balance < amount) {
    return {
      status: "Bad Request",
      message: "Insufficient balance in source account",
    };
  }

  return {
    status: "success",
    message: "Input is valid",
  };
};

module.exports = {
  createTransaction,
  getAllTransaction,
  getTransactionById,
  deleteTransactionById,
  validateInput,
};
