const express = require("express");
const { body, param } = require("express-validator");

const {
  createAdminOrder,
  createOrder,
  deleteAdminOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateAdminOrder,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.get("/my-orders", getMyOrders);
router.get("/admin", adminOnly, getAllOrders);
router.post(
  "/admin",
  adminOnly,
  [
    body("userId").isMongoId().withMessage("A valid user id is required."),
    body("orderItems").isArray({ min: 1 }).withMessage("At least one order item is required."),
    body("orderItems.*.productId")
      .isMongoId()
      .withMessage("A valid product id is required for each order item."),
    body("orderItems.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Each order item quantity must be at least 1."),
    body("shippingAddress.fullName").notEmpty().withMessage("Full name is required."),
    body("shippingAddress.phone").notEmpty().withMessage("Phone number is required."),
    body("shippingAddress.street").notEmpty().withMessage("Street is required."),
    body("shippingAddress.city").notEmpty().withMessage("City is required."),
    body("paymentMethod")
      .isIn(["cod", "gcash"])
      .withMessage("Payment method must be either cod or gcash."),
    body("paymentStatus")
      .optional()
      .isIn(["pending", "paid", "failed"])
      .withMessage("Invalid payment status."),
    body("orderStatus")
      .optional()
      .isIn([
        "pending",
        "need_payment",
        "processing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ])
      .withMessage("Invalid order status."),
  ],
  validateRequest,
  createAdminOrder
);
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("A valid order id is required.")],
  validateRequest,
  getOrderById
);
router.post(
  "/",
  [
    body("shippingAddress.fullName").notEmpty().withMessage("Full name is required."),
    body("shippingAddress.phone").notEmpty().withMessage("Phone number is required."),
    body("shippingAddress.street").notEmpty().withMessage("Street is required."),
    body("shippingAddress.city").notEmpty().withMessage("City is required."),
    body("paymentMethod")
      .isIn(["cod", "gcash"])
      .withMessage("Payment method must be either cod or gcash."),
  ],
  validateRequest,
  createOrder
);
router.put(
  "/:id/status",
  adminOnly,
  [
    param("id").isMongoId().withMessage("A valid order id is required."),
    body("orderStatus")
      .optional()
      .isIn([
        "pending",
        "need_payment",
        "processing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ])
      .withMessage("Invalid order status."),
    body("paymentStatus")
      .optional()
      .isIn(["pending", "paid", "failed"])
      .withMessage("Invalid payment status."),
  ],
  validateRequest,
  updateOrderStatus
);
router.put(
  "/admin/:id",
  adminOnly,
  [
    param("id").isMongoId().withMessage("A valid order id is required."),
    body("paymentMethod")
      .optional()
      .isIn(["cod", "gcash"])
      .withMessage("Payment method must be either cod or gcash."),
    body("paymentStatus")
      .optional()
      .isIn(["pending", "paid", "failed"])
      .withMessage("Invalid payment status."),
    body("orderStatus")
      .optional()
      .isIn([
        "pending",
        "need_payment",
        "processing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ])
      .withMessage("Invalid order status."),
  ],
  validateRequest,
  updateAdminOrder
);
router.delete(
  "/admin/:id",
  adminOnly,
  [param("id").isMongoId().withMessage("A valid order id is required.")],
  validateRequest,
  deleteAdminOrder
);

module.exports = router;
