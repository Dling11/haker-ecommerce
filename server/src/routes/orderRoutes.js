const express = require("express");
const { body, param } = require("express-validator");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.get("/my-orders", getMyOrders);
router.get("/admin", adminOnly, getAllOrders);
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

module.exports = router;
