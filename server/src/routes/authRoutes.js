const express = require("express");
const { body } = require("express-validator");

const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationOtp,
  getCurrentUser,
  updateProfile,
  logoutUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
  ],
  validateRequest,
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validateRequest,
  loginUser
);
router.post(
  "/verify-email",
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("otp")
      .trim()
      .matches(/^\d{6}$/)
      .withMessage("Verification code must be 6 digits."),
  ],
  validateRequest,
  verifyEmail
);
router.post(
  "/resend-verification-otp",
  [body("email").isEmail().withMessage("A valid email is required.")],
  validateRequest,
  resendVerificationOtp
);

router.post("/logout", logoutUser);
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);

module.exports = router;
