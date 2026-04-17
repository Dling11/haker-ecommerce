const express = require("express");
const { param } = require("express-validator");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);
router.post(
  "/:productId",
  [param("productId").isMongoId().withMessage("A valid product id is required.")],
  validateRequest,
  addToWishlist
);
router.delete(
  "/:productId",
  [param("productId").isMongoId().withMessage("A valid product id is required.")],
  validateRequest,
  removeFromWishlist
);

module.exports = router;
