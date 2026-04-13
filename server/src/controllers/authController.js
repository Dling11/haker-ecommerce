const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const { deleteCloudinaryImage } = require("../utils/cloudinaryAsset");
const { getSiteSettings } = require("../utils/siteSettings");
const {
  OTP_EXPIRY_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
  PASSWORD_RESET_EXPIRY_MINUTES,
  PASSWORD_RESET_RESEND_COOLDOWN_SECONDS,
  assignEmailVerificationOtp,
  assignPasswordResetOtp,
  clearEmailVerificationOtp,
  clearPasswordResetOtp,
  getOtpResendCooldownRemaining,
  getPasswordResetCooldownRemaining,
  isOtpExpired,
  isOtpValid,
  isPasswordResetOtpExpired,
  isPasswordResetOtpValid,
} = require("../utils/emailOtp");
const {
  sendPasswordResetEmail,
  sendVerificationOtpEmail,
} = require("../services/emailService");

const buildUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  isEmailVerified: user.isEmailVerified,
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
  const role = usersCount === 0 ? "admin" : "customer";

  if (role !== "admin" && !settings.allowCustomerRegistration) {
    res.status(403);
    throw new Error("Customer registration is currently disabled.");
  }

  const shouldRequireEmailVerification =
    role !== "admin" && settings.emailSystemEnabled;

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    role,
    isEmailVerified: role === "admin" || !shouldRequireEmailVerification,
    emailVerifiedAt:
      role === "admin" || !shouldRequireEmailVerification ? new Date() : null,
  });

  if (role === "admin" || !shouldRequireEmailVerification) {
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: buildUserPayload(user),
      token,
    });
    return;
  }

  const otp = assignEmailVerificationOtp(user);
  await user.save();

  let emailSent = false;

  try {
    await sendVerificationOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      expiryMinutes: OTP_EXPIRY_MINUTES,
    });
    emailSent = true;
  } catch (error) {
    console.error("Failed to send verification OTP email:", error.message);
  }

  res.status(201).json({
    success: true,
    message: emailSent
      ? "Account created. Please verify your email to continue."
      : "Account created. We could not send the verification email right away, but you can request a new code.",
    requiresEmailVerification: true,
    email: user.email,
    emailSent,
    resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
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

  if (user.role !== "admin" && settings.emailSystemEnabled && !user.isEmailVerified) {
    res.status(403);
    throw new Error("Please verify your email before logging in.");
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

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const settings = await getSiteSettings();

  if (!settings.emailSystemEnabled) {
    res.status(403);
    throw new Error("Email verification is currently unavailable.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpiresAt +emailVerificationOtpLastSentAt"
  );

  if (!user) {
    res.status(404);
    throw new Error("No verification request was found for that email.");
  }

  if (user.isEmailVerified) {
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Email already verified.",
      user: buildUserPayload(user),
      token,
    });
    return;
  }

  if (isOtpExpired(user)) {
    res.status(400);
    throw new Error("This verification code has expired. Please request a new one.");
  }

  if (!isOtpValid(user, otp)) {
    res.status(400);
    throw new Error("The verification code you entered is incorrect.");
  }

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  clearEmailVerificationOtp(user);
  await user.save();

  const token = generateToken(user._id);
  setAuthCookie(res, token);

  res.status(200).json({
    success: true,
    message: "Email verified successfully.",
    user: buildUserPayload(user),
    token,
  });
});

const resendVerificationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const settings = await getSiteSettings();

  if (!settings.emailSystemEnabled) {
    res.status(403);
    throw new Error("Email verification is currently unavailable.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpiresAt +emailVerificationOtpLastSentAt"
  );

  if (!user) {
    res.status(404);
    throw new Error("No account was found for that email.");
  }

  if (user.isEmailVerified) {
    res.status(400);
    throw new Error("This email is already verified.");
  }

  const cooldownRemaining = getOtpResendCooldownRemaining(user);

  if (cooldownRemaining > 0) {
    res.status(429);
    throw new Error(`Please wait ${cooldownRemaining} seconds before requesting a new code.`);
  }

  const otp = assignEmailVerificationOtp(user);
  await user.save();

  let emailSent = false;

  try {
    await sendVerificationOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      expiryMinutes: OTP_EXPIRY_MINUTES,
    });
    emailSent = true;
  } catch (error) {
    console.error("Failed to resend verification OTP email:", error.message);
  }

  if (!emailSent) {
    res.status(500);
    throw new Error("We could not send a new verification code right now. Please try again later.");
  }

  res.status(200).json({
    success: true,
    message: "A new verification code has been sent.",
    email: user.email,
    resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const settings = await getSiteSettings();

  if (!settings.emailSystemEnabled) {
    res.status(403);
    throw new Error("Password recovery is currently unavailable.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpLastSentAt"
  );

  if (!user) {
    res.status(200).json({
      success: true,
      message:
        "If that email is registered, a password reset code has been sent.",
      email: email.toLowerCase(),
    });
    return;
  }

  const cooldownRemaining = getPasswordResetCooldownRemaining(user);

  if (cooldownRemaining > 0) {
    res.status(429);
    throw new Error(
      `Please wait ${cooldownRemaining} seconds before requesting another reset code.`
    );
  }

  const otp = assignPasswordResetOtp(user);
  await user.save();

  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      otp,
      expiryMinutes: PASSWORD_RESET_EXPIRY_MINUTES,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error.message);
    res.status(500);
    throw new Error("We could not send a reset code right now. Please try again later.");
  }

  res.status(200).json({
    success: true,
    message: "If that email is registered, a password reset code has been sent.",
    email: user.email,
    resendCooldownSeconds: PASSWORD_RESET_RESEND_COOLDOWN_SECONDS,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const settings = await getSiteSettings();

  if (!settings.emailSystemEnabled) {
    res.status(403);
    throw new Error("Password recovery is currently unavailable.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password +passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpLastSentAt"
  );

  if (!user) {
    res.status(404);
    throw new Error("No password reset request was found for that email.");
  }

  if (isPasswordResetOtpExpired(user)) {
    res.status(400);
    throw new Error("This reset code has expired. Please request a new one.");
  }

  if (!isPasswordResetOtpValid(user, otp)) {
    res.status(400);
    throw new Error("The reset code you entered is incorrect.");
  }

  user.password = newPassword;
  clearPasswordResetOtp(user);

  if (!user.isEmailVerified && settings.emailSystemEnabled) {
    user.isEmailVerified = true;
    user.emailVerifiedAt = user.emailVerifiedAt || new Date();
    clearEmailVerificationOtp(user);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully. Please log in with your new password.",
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
  forgotPassword,
  verifyEmail,
  resendVerificationOtp,
  resetPassword,
  getCurrentUser,
  updateProfile,
  logoutUser,
};
