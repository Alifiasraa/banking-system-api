const request = require("supertest");
const app = require("../app");
const accountService = require("../src/services/account.service");
const jwt = require("jsonwebtoken");

jest.mock("../src/services/account.service");

describe("Account Controller", () => {
  beforeAll(() => {
    jest.clearAllMocks();

    token = jwt.sign(
      { id: 1, email: "johndoe@example.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  describe("POST /accounts", () => {
    it("should create an account successfully", async () => {
      accountService.validateInput.mockResolvedValue({
        status: "success",
        message: "Input is valid",
      });
      accountService.createAccount.mockResolvedValue({
        id: 1,
        user_id: 1,
        bank_name: "Bank ABC",
        bank_account_number: "1234567890",
        balance: 1000,
      });

      const res = await request(app)
        .post("/api/v1/accounts")
        .send({
          user_id: 1,
          bank_name: "Bank ABC",
          bank_account_number: "1234567890",
          balance: 1000,
        })
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Account created successfully");
      expect(res.body.account).toHaveProperty("id");
    });

    it("should return 400 if input validation fails", async () => {
      accountService.validateInput.mockResolvedValue({
        status: "Bad Request",
        message: "Bank account number is already in use",
      });

      const res = await request(app)
        .post("/api/v1/accounts")
        .send({
          user_id: 1,
          bank_name: "Bank ABC",
          bank_account_number: "1234567890",
          balance: 1000,
        })
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Bank account number is already in use");
    });

    it("should return 500 if an error occurs", async () => {
      accountService.validateInput.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          user_id: 1,
          bank_name: "Bank ABC",
          bank_account_number: "1234567890",
          balance: 1000,
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("GET /accounts", () => {
    it("should retrieve all accounts successfully", async () => {
      accountService.getAllAccounts.mockResolvedValue([
        {
          id: 1,
          user_id: 1,
          bank_name: "Bank ABC",
          bank_account_number: "1234567890",
          balance: 1000,
        },
        {
          id: 2,
          user_id: 2,
          bank_name: "Bank XYZ",
          bank_account_number: "0987654321",
          balance: 2000,
        },
      ]);

      const res = await request(app)
        .get("/api/v1/accounts")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Accounts retrieved successfully");
      expect(res.body.accounts).toHaveLength(2);
    });

    it("should return 500 if an error occurs", async () => {
      accountService.getAllAccounts.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .get("/api/v1/accounts")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("GET /accounts/:id", () => {
    it("should retrieve an account by ID successfully", async () => {
      accountService.getAccountById.mockResolvedValue({
        id: 1,
        user_id: 1,
        bank_name: "Bank ABC",
        bank_account_number: "1234567890",
        balance: 1000,
      });

      const res = await request(app)
        .get("/api/v1/accounts/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Account retrieved successfully");
      expect(res.body.account).toHaveProperty("id");
    });

    it("should return 404 if account is not found", async () => {
      accountService.getAccountById.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/v1/accounts/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Account not found");
    });

    it("should return 500 if an error occurs", async () => {
      accountService.getAccountById.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .get("/api/v1/accounts/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("PUT /accounts/:id", () => {
    it("should update an account by ID successfully", async () => {
      accountService.getAccountById.mockResolvedValue({
        id: 1,
        user_id: 1,
        bank_name: "Bank ABC",
        bank_account_number: "1234567890",
        balance: 1000,
      });
      accountService.updateAccountById.mockResolvedValue({
        id: 1,
        user_id: 1,
        bank_name: "Bank ABC Updated",
        bank_account_number: "1234567890",
        balance: 1500,
      });

      const res = await request(app)
        .put("/api/v1/accounts/1")
        .send({
          bank_name: "Bank ABC Updated",
          balance: 1500,
        })
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Account updated successfully");
      expect(res.body.account).toHaveProperty("id");
      expect(res.body.account.bank_name).toBe("Bank ABC Updated");
    });

    it("should return 404 if account is not found", async () => {
      accountService.getAccountById.mockResolvedValue(null);

      const res = await request(app)
        .put("/api/v1/accounts/999")
        .send({
          bank_name: "Bank ABC Updated",
          balance: 1500,
        })
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Account not found");
    });

    it("should return 500 if an error occurs", async () => {
      accountService.getAccountById.mockResolvedValue({
        id: 1,
        user_id: 1,
        bank_name: "Bank ABC",
        bank_account_number: "1234567890",
        balance: 1000,
      });
      accountService.updateAccountById.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .put("/api/v1/accounts/1")
        .send({
          bank_name: "Bank ABC Updated",
          balance: 1500,
        })
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("DELETE /accounts/:id", () => {
    it("should delete an account by ID successfully", async () => {
      accountService.getAccountById.mockResolvedValue({
        id: 1,
        user_id: 1,
        bank_name: "Bank ABC",
        bank_account_number: "1234567890",
        balance: 1000,
      });
      accountService.deleteAccountById.mockResolvedValue();

      const res = await request(app)
        .delete("/api/v1/accounts/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Account deleted successfully");
    });

    it("should return 404 if account is not found", async () => {
      accountService.getAccountById.mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/v1/accounts/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Account not found");
    });

    it("should return 500 if an error occurs", async () => {
      accountService.getAccountById.mockResolvedValue({
        id: 1,
        user_id: 1,
        bank_name: "Bank ABC",
        bank_account_number: "1234567890",
        balance: 1000,
      });
      accountService.deleteAccountById.mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app)
        .delete("/api/v1/accounts/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });
});
