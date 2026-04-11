const bcrypt = require("bcryptjs");

const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { deleteCloudinaryImage } = require("../utils/cloudinaryAsset");

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    users,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  res.status(200).json({
    success: true,
    user,
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, status, avatar, shippingAddress } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    res.status(400);
    throw new Error("A user with that email already exists.");
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone: phone || "",
    role: role || "customer",
    status: status || "active",
    avatar: avatar || { url: "", publicId: "" },
    shippingAddress: shippingAddress || {},
  });

  const sanitizedUser = await User.findById(user._id).select("-password");

  res.status(201).json({
    success: true,
    message: "User created successfully.",
    user: sanitizedUser,
  });
});

const updateUserManagement = asyncHandler(async (req, res) => {
  const { name, email, phone, role, status, avatar, shippingAddress, password } = req.body;
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const previousAvatarPublicId = user.avatar?.publicId || "";

  if (email && email.toLowerCase() !== user.email) {
    const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });

    if (existingUser) {
      res.status(400);
      throw new Error("A user with that email already exists.");
    }

    user.email = email.toLowerCase();
  }

  if (name) {
    user.name = name;
  }

  if (phone !== undefined) {
    user.phone = phone;
  }

  if (role) {
    user.role = role;
  }

  if (status) {
    user.status = status;
  }

  if (avatar) {
    user.avatar = {
      url: avatar.url || "",
      publicId: avatar.publicId || "",
    };
  }

  if (shippingAddress) {
    user.shippingAddress = {
      ...user.shippingAddress?.toObject?.(),
      ...shippingAddress,
    };
  }

  await user.save();

  if (
    previousAvatarPublicId &&
    avatar &&
    avatar.publicId &&
    avatar.publicId !== previousAvatarPublicId
  ) {
    await deleteCloudinaryImage(previousAvatarPublicId);
  }

  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, { password: passwordHash });
  }

  const updatedUser = await User.findById(user._id).select("-password");

  res.status(200).json({
    success: true,
    message: "User updated successfully.",
    user: updatedUser,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Admin users cannot be deleted.");
  }

  const avatarPublicId = user.avatar?.publicId || "";

  await user.deleteOne();

  if (avatarPublicId) {
    await deleteCloudinaryImage(avatarPublicId);
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully.",
  });
});

module.exports = {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUserManagement,
};
