const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

const registerUser = async (body) => {
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: bcrypt.hashSync(body.password, 10),
    },
  });

  const profile = await prisma.profile.create({
    data: {
      user_id: user.id,
      identity_type: body.identity_type,
      identity_number: body.identity_number,
      address: body.address,
    },
  });

  delete user.password;

  return { user, profile };
};

const loginUser = async (body) => {
  const { email, password } = body;

  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user)
    return { status: "Bad Request", message: "Invalid email or password" };

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return { status: "Bad Request", message: "Invalid email or password" };
  }

  delete user.password;

  const payload_token = {
    id: user.id,
    email: email,
  };

  const token = jwt.sign(payload_token, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return { token, user };
};

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profile: {
        select: {
          identity_type: true,
          identity_number: true,
          address: true,
        },
      },
    },
  });
};

const getUserByEmail = async (body) => {
  return await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });
};

const getUserByIdentityNumber = async (body) => {
  return await prisma.profile.findUnique({
    where: {
      identity_number: body.identity_number,
    },
    include: {
      user: true,
    },
  });
};

const updateUserById = async (id, body) => {
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      email: body.email,
      password: bcrypt.hashSync(body.password, 10),
    },
  });

  const profile = await prisma.profile.update({
    where: { user_id: id },
    data: {
      user_id: user.id,
      identity_type: body.identity_type,
      identity_number: body.identity_number,
      address: body.address,
    },
  });

  delete user.password;

  return { user, profile };
};

const deleteUserById = async (id) => {
  return await prisma.user.delete({
    where: {
      id: id,
    },
  });
};

const validateInput = async (body) => {
  if (!body.name) {
    return { status: "Bad Request", message: "Name is required" };
  }

  if (!body.email) {
    return { status: "Bad Request", message: "Email is required" };
  }

  if (!body.password) {
    return { status: "Bad Request", message: "Password is required" };
  }

  if (!body.identity_type) {
    return { status: "Bad Request", message: "Identity type is required" };
  }

  if (!body.identity_number) {
    return { status: "Bad Request", message: "Identity number is required" };
  }

  if (!body.address) {
    return { status: "Bad Request", message: "Address is required" };
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (user) {
    return { status: "Bad Request", message: "Email is already in use" };
  }

  const identity_number = await prisma.profile.findUnique({
    where: { identity_number: body.identity_number },
  });

  if (identity_number) {
    return {
      status: "Bad Request",
      message: "Identity number is already in use",
    };
  }

  return {
    status: "success",
    message: "Input is valid",
  };
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByIdentityNumber,
  updateUserById,
  deleteUserById,
  validateInput,
};
