const request = require("supertest");
const app = require("../app");
const transactionService = require("../src/services/transaction.service");
const jwt = require("jsonwebtoken");

jest.mock("../src/services/transaction.service");

describe("Transaction Controller", () => {
  beforeAll(() => {
    jest.clearAllMocks();

    token = jwt.sign(
      { id: 1, email: "johndoe@example.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  describe("POST /transactions", () => {
    it("should create a new transaction if input is valid", async () => {
      const validTransaction = {
        source_account_id: "1",
        destination_account_id: "2",
        amount: 100,
      };

      transactionService.validateInput.mockResolvedValue({
        status: "success",
        message: "Input is valid",
      });
      transactionService.createTransaction.mockResolvedValue(validTransaction);

      const res = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send(validTransaction);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Transaction created successfully");
      expect(res.body.transaction).toEqual(validTransaction);
    });

    it("should return 400 if input validation fails", async () => {
      const invalidTransaction = {
        source_account_id: "",
        destination_account_id: "2",
        amount: -100,
      };

      transactionService.validateInput.mockResolvedValue({
        status: "Bad Request",
        message: "Source account ID is required",
      });

      const res = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidTransaction);

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Source account ID is required");
    });

    it("should return 500 if an error occurs", async () => {
      transactionService.validateInput.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          source_account_id: "1",
          destination_account_id: "2",
          amount: 100,
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("GET /transactions", () => {
    it("should retrieve all transactions", async () => {
      const transactions = [
        {
          id: "1",
          source_account_id: "1",
          destination_account_id: "2",
          amount: 100,
        },
        {
          id: "2",
          source_account_id: "2",
          destination_account_id: "3",
          amount: 200,
        },
      ];

      transactionService.getAllTransaction.mockResolvedValue(transactions);

      const res = await request(app)
        .get("/api/v1/transactions")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Transactions retrieved successfully");
      expect(res.body.transactions).toEqual(transactions);
    });

    it("should return 500 if an error occurs", async () => {
      transactionService.getAllTransaction.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .get("/api/v1/transactions")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("GET /transactions/:id", () => {
    it("should retrieve a transaction by ID", async () => {
      const transaction = {
        id: "1",
        source_account_id: "1",
        destination_account_id: "2",
        amount: 100,
      };

      transactionService.getTransactionById.mockResolvedValue(transaction);

      const res = await request(app)
        .get("/api/v1/transactions/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Transaction retrieved successfully");
      expect(res.body.transaction).toEqual(transaction);
    });

    it("should return 404 if transaction not found", async () => {
      transactionService.getTransactionById.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/v1/transactions/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Transaction not found");
    });

    it("should return 500 if an error occurs", async () => {
      transactionService.getTransactionById.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .get("/api/v1/transactions/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("DELETE /transactions/:id", () => {
    it("should delete a transaction by ID", async () => {
      transactionService.getTransactionById.mockResolvedValue({ id: "1" });
      transactionService.deleteTransactionById.mockResolvedValue();

      const res = await request(app)
        .delete("/api/v1/transactions/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Transaction deleted successfully");
    });

    it("should return 404 if transaction not found", async () => {
      transactionService.getTransactionById.mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/v1/transactions/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Transaction not found");
    });

    it("should return 500 if an error occurs", async () => {
      transactionService.getTransactionById.mockResolvedValue({ id: "1" });
      transactionService.deleteTransactionById.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .delete("/api/v1/transactions/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });
});
