const express = require("express");
const { body, param, query } = require("express-validator");

const {
  getAdminCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get(
  "/validate",
  protect,
  [
    query("code").trim().notEmpty().withMessage("Coupon code is required."),
    query("subtotal").optional().isFloat({ min: 0 }).withMessage("Subtotal must be valid."),
  ],
  validateRequest,
  validateCoupon
);
router.get("/admin", protect, adminOnly, getAdminCoupons);
router.post(
  "/",
  protect,
  adminOnly,
  [
    body("code").trim().notEmpty().withMessage("Coupon code is required."),
    body("discountType")
      .isIn(["percentage", "fixed"])
      .withMessage("Discount type must be percentage or fixed."),
    body("discountValue").isFloat({ min: 0 }).withMessage("Discount value must be valid."),
  ],
  validateRequest,
  createCoupon
);
router.put(
  "/:id",
  protect,
  adminOnly,
  [param("id").isMongoId().withMessage("A valid coupon id is required.")],
  validateRequest,
  updateCoupon
);
router.delete(
  "/:id",
  protect,
  adminOnly,
  [param("id").isMongoId().withMessage("A valid coupon id is required.")],
  validateRequest,
  deleteCoupon
);

module.exports = router;
