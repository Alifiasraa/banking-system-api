const request = require("supertest");
const app = require("../app");
const userService = require("../src/services/user.service");
const jwt = require("jsonwebtoken");

jest.mock("../src/services/user.service");

describe("User Controller", () => {
  beforeAll(() => {
    jest.clearAllMocks();

    token = jwt.sign(
      { id: 1, email: "johndoe@example.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  describe("POST /register", () => {
    it("should register a new user successfully", async () => {
      userService.validateInput.mockResolvedValue({
        status: "success",
        message: "Input is valid",
      });
      userService.registerUser.mockResolvedValue({
        user: { id: 1, name: "John Doe", email: "johndoe@example.com" },
        profile: {
          identity_type: "KTP",
          identity_number: "1234567890",
          address: "bandung",
        },
      });

      const res = await request(app).post("/api/v1/register").send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
        identity_type: "KTP",
        identity_number: "1234567890",
        address: "bandung",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual("success");
      expect(res.body.message).toEqual("Register successfully");
      expect(res.body.data).toHaveProperty("user");
      expect(res.body.data).toHaveProperty("profile");
    });

    it("should return 400 if input validation fails", async () => {
      userService.validateInput.mockResolvedValue({
        status: "Bad Request",
        message: "Email is already in use",
      });

      const res = await request(app).post("/api/v1/register").send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
        identity_type: "KTP",
        identity_number: "123456789",
        address: "bandung",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toEqual("error");
      expect(res.body.message).toEqual("Email is already in use");
    });

    it("should return 500 if an error occurs", async () => {
      userService.validateInput.mockRejectedValue(new Error("Database error"));

      const res = await request(app).post("/api/v1/register").send({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "password123",
        identity_type: "KTP",
        identity_number: "1234567890",
        address: "bandung",
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("POST /login", () => {
    it("should login successfully", async () => {
      userService.loginUser.mockResolvedValue({
        token: `${token}`,
        user: { id: 1, name: "John Doe", email: "johndoe@example.com" },
      });

      const res = await request(app).post("/api/v1/login").send({
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Login successfully");
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.user).toHaveProperty("id");
    });

    it("should return 400 if login fails", async () => {
      userService.loginUser.mockResolvedValue({
        status: "Bad Request",
        message: "Invalid email or password",
      });

      const res = await request(app).post("/api/v1/login").send({
        email: "johndoe@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should return 500 if an error occurs", async () => {
      userService.loginUser = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).post("/api/v1/login").send({
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("GET /users", () => {
    it("should retrieve all users successfully", async () => {
      userService.getAllUsers.mockResolvedValue([
        { id: 1, name: "John Doe", email: "johndoe@example.com" },
        { id: 2, name: "Jane Doe", email: "janedoe@example.com" },
      ]);

      const res = await request(app).get("/api/v1/users");

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("Users retrieved successfully");
      expect(res.body.users).toHaveLength(2);
    });

    it("should return 500 if an error occurs", async () => {
      userService.getAllUsers.mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/v1/users");

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("GET /users/:id", () => {
    it("should retrieve a user by ID successfully", async () => {
      userService.getUserById.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "johndoe@example.com",
        profile: {
          identity_type: "KTP",
          identity_number: "12345678900",
          address: "bandung",
        },
        accounts: [],
      });

      const res = await request(app)
        .get("/api/v1/users/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("User retrieved successfully");
      expect(res.body.user).toHaveProperty("id");
    });

    it("should return 404 if user is not found", async () => {
      userService.getUserById.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/v1/users/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("User not found");
    });

    it("should return 500 if an error occurs", async () => {
      userService.getUserById.mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .get("/api/v1/users/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("PUT /users/:id", () => {
    it("should update user by ID successfully", async () => {
      userService.getUserById.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "johndoe@example.com",
      });
      userService.getUserByEmail.mockResolvedValue(null); // Simulate email is available
      userService.getUserByIdentityNumber.mockResolvedValue(null); // Simulate identity number is available
      userService.updateUserById.mockResolvedValue({
        id: 1,
        name: "John Doe Updated",
        email: "johndoeupdated@example.com",
      });

      const res = await request(app)
        .put("/api/v1/users/1")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "John Doe Updated",
          email: "johndoeupdated@example.com",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("User updated successfully");
      expect(res.body.user).toHaveProperty("id", 1);
      expect(res.body.user).toHaveProperty("name", "John Doe Updated");
      expect(res.body.user).toHaveProperty(
        "email",
        "johndoeupdated@example.com"
      );
    });

    it("should return 404 if user is not found", async () => {
      userService.getUserById.mockResolvedValue(null); // Simulate user not found

      const res = await request(app)
        .put("/api/v1/users/999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "John Doe Updated",
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("User not found");
    });

    it("should return 400 if email is already in use", async () => {
      userService.getUserById.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "johndoe@example.com",
      });
      userService.getUserByEmail.mockResolvedValue({
        id: 2,
        email: "anotheruser@example.com",
      }); // Simulate email is already in use
      userService.getUserByIdentityNumber.mockResolvedValue(null); // Simulate identity number is available

      const res = await request(app)
        .put("/api/v1/users/1")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "anotheruser@example.com",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Email is already in use by another user");
    });

    it("should return 400 if identity number is already in use", async () => {
      userService.getUserById.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "johndoe@example.com",
      });
      userService.getUserByEmail.mockResolvedValue(null); // Simulate email is available
      userService.getUserByIdentityNumber.mockResolvedValue({
        user: {
          id: 2,
        },
      }); // Simulate identity number is already in use

      const res = await request(app)
        .put("/api/v1/users/1")
        .set("Authorization", `Bearer ${token}`)
        .send({
          identity_number: "1234567890",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe(
        "Identity number is already in use by another user"
      );
    });

    it("should return 500 if an error occurs", async () => {
      userService.getUserById.mockResolvedValue({
        id: 1,
        name: "John Doe",
        email: "johndoe@example.com",
      });
      userService.getUserByEmail.mockResolvedValue(null); // Simulate email is available
      userService.getUserByIdentityNumber.mockResolvedValue(null); // Simulate identity number is available
      userService.updateUserById.mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .put("/api/v1/users/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete user by ID successfully", async () => {
      userService.getUserById.mockResolvedValue({
        id: 1,
        name: "John Doe",
      });
      userService.deleteUserById.mockResolvedValue();

      const res = await request(app)
        .delete("/api/v1/users/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.message).toBe("User deleted successfully");
    });

    it("should return 404 if user is not found", async () => {
      userService.getUserById.mockResolvedValue(null); // Simulate user not found

      const res = await request(app)
        .delete("/api/v1/users/999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("User not found");
    });

    it("should return 500 if an error occurs", async () => {
      userService.getUserById.mockResolvedValue({
        id: 1,
        name: "John Doe",
      });
      userService.deleteUserById.mockRejectedValue(new Error("Database error"));

      const res = await request(app)
        .delete("/api/v1/users/1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Database error");
    });
  });
});
