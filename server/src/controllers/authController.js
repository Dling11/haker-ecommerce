const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const { deleteCloudinaryImage } = require("../utils/cloudinaryAsset");
const { getSiteSettings } = require("../utils/siteSettings");

const buildUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  phone: user.phone,
  avatar: user.avatar,
  shippingAddress: user.shippingAddress,
  createdAt: user.createdAt,
});

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 3 * 60 * 60 * 1000,
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const settings = await getSiteSettings();

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with that email already exists.");
  }

  const usersCount = await User.countDocuments();

  if (usersCount > 0 && !settings.allowCustomerRegistration) {
    res.status(403);
    throw new Error("Customer registration is currently disabled.");
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    role: usersCount === 0 ? "admin" : "customer",
  });

  const token = generateToken(user._id);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: "Registration successful.",
    user: buildUserPayload(user),
    token,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const settings = await getSiteSettings();

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  if (user.status === "banned") {
    res.status(403);
    throw new Error("This account has been banned. Please contact support.");
  }

  if (user.status === "inactive") {
    res.status(403);
    throw new Error("This account is inactive. Please contact support.");
  }

  if (user.role !== "admin" && settings.maintenanceMode) {
    res.status(503);
    throw new Error(settings.maintenanceMessage);
  }

  if (user.role !== "admin" && !settings.allowCustomerLogin) {
    res.status(403);
    throw new Error("Login is temporarily unavailable. Please try again later.");
  }

  const token = generateToken(user._id);
  setAuthCookie(res, token);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    user: buildUserPayload(user),
    token,
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const previousAvatarPublicId = user.avatar?.publicId || "";

  user.name = req.body.name || user.name;
  user.phone = req.body.phone ?? user.phone;
  user.avatar = req.body.avatar || user.avatar;
  user.shippingAddress = {
    ...(user.shippingAddress?.toObject?.() || {}),
    ...(req.body.shippingAddress || {}),
  };

  if (req.body.password) {
    user.password = req.body.password;
  }

  await user.save();

  if (
    previousAvatarPublicId &&
    req.body.avatar?.publicId &&
    req.body.avatar.publicId !== previousAvatarPublicId
  ) {
    await deleteCloudinaryImage(previousAvatarPublicId);
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user: buildUserPayload(user),
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  logoutUser,
};
