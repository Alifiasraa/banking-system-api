const userService = require("../services/user.service");

const registerUser = async (req, res) => {
  try {
    const input = await userService.validateInput(req.body);
    if (input.status === "Bad Request") {
      return res.status(400).json({
        status: "error",
        message: input.message,
      });
    }

    const register = await userService.registerUser(req.body);
    res.status(201).json({
      status: "success",
      message: "Register successfully",
      data: register,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const login = await userService.loginUser(req.body);

    if (login.status === "Bad Request") {
      return res.status(400).json({
        status: "error",
        message: login.message,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Login successfully",
      data: login,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User retrieved successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const email = await userService.getUserByEmail(req.body);
    if (email && email.id !== id) {
      return res.status(400).json({
        status: "error",
        message: "Email is already in use by another user",
      });
    }

    const identityNumber = await userService.getUserByIdentityNumber(req.body);
    if (identityNumber && identityNumber.user.id !== id) {
      return res.status(400).json({
        status: "error",
        message: "Identity number is already in use by another user",
      });
    }

    const user = await userService.updateUserById(id, req.body);
    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    await userService.deleteUserById(id);
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
