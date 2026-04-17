const express = require("express");
const { body, param } = require("express-validator");

const {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.get("/", getMyCart);
router.post(
  "/",
  [
    body("productId").isMongoId().withMessage("A valid product id is required."),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1."),
    body("color").optional().trim(),
    body("size").optional().trim(),
  ],
  validateRequest,
  addToCart
);
router.put(
  "/:itemId",
  [
    param("itemId").isMongoId().withMessage("A valid cart item id is required."),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1."),
  ],
  validateRequest,
  updateCartItem
);
router.delete(
  "/:itemId",
  [param("itemId").isMongoId().withMessage("A valid cart item id is required.")],
  validateRequest,
  removeCartItem
);
router.delete("/clear/all", clearCart);

module.exports = router;
