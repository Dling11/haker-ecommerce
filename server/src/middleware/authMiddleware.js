const jwt = require("jsonwebtoken");

const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { getSiteSettings } = require("../utils/siteSettings");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized. Token is missing.");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    res.status(401);
    throw new Error("User no longer exists.");
  }

  if (user.status === "banned") {
    res.status(403);
    throw new Error("This account has been banned. Please contact support.");
  }

  if (user.status === "inactive") {
    res.status(403);
    throw new Error("This account is inactive. Please contact support.");
  }

  if (user.role !== "admin" && !user.isEmailVerified) {
    res.status(403);
    throw new Error("Please verify your email before continuing.");
  }

  const settings = await getSiteSettings();

  if (user.role !== "admin" && settings.maintenanceMode) {
    res.status(503);
    throw new Error(settings.maintenanceMessage);
  }

  req.user = user;
  next();
});

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access only.");
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
};
