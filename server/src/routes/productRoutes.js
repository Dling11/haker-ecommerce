const express = require("express");
const { body, param } = require("express-validator");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  addProductReview,
  updateAdminProductReview,
  deleteAdminProductReview,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", getProducts);
router.get("/admin", protect, adminOnly, getAdminProducts);
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("A valid product id is required.")],
  validateRequest,
  getProductById
);
router.post(
  "/:id/reviews",
  protect,
  [
    param("id").isMongoId().withMessage("A valid product id is required."),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),
    body("comment").trim().notEmpty().withMessage("Comment is required."),
  ],
  validateRequest,
  addProductReview
);
router.put(
  "/:id/reviews/:reviewId",
  protect,
  adminOnly,
  [
    param("id").isMongoId().withMessage("A valid product id is required."),
    param("reviewId").isMongoId().withMessage("A valid review id is required."),
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),
    body("comment")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Comment is required when updating a review."),
  ],
  validateRequest,
  updateAdminProductReview
);
router.delete(
  "/:id/reviews/:reviewId",
  protect,
  adminOnly,
  [
    param("id").isMongoId().withMessage("A valid product id is required."),
    param("reviewId").isMongoId().withMessage("A valid review id is required."),
  ],
  validateRequest,
  deleteAdminProductReview
);

router.post(
  "/",
  protect,
  adminOnly,
  [
    body("name").trim().notEmpty().withMessage("Product name is required."),
    body("description").trim().notEmpty().withMessage("Product description is required."),
    body("category").trim().notEmpty().withMessage("Category is required."),
    body("price").isFloat({ min: 0 }).withMessage("Price must be 0 or greater."),
    body("comparePrice")
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage("Compare price must be 0 or greater."),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be 0 or greater."),
    body("images").isArray({ min: 1 }).withMessage("At least one image is required."),
    body("images.*.url").notEmpty().withMessage("Each image must include a url."),
    body("colors").optional().isArray().withMessage("Colors must be an array."),
    body("colors.*").optional().trim().notEmpty().withMessage("Colors cannot be empty."),
    body("sizes").optional().isArray().withMessage("Sizes must be an array."),
    body("sizes.*").optional().trim().notEmpty().withMessage("Sizes cannot be empty."),
  ],
  validateRequest,
  createProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  [
    param("id").isMongoId().withMessage("A valid product id is required."),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be 0 or greater."),
    body("comparePrice")
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage("Compare price must be 0 or greater."),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be 0 or greater."),
    body("images").optional().isArray({ min: 1 }).withMessage("At least one image is required."),
    body("images.*.url").optional().notEmpty().withMessage("Each image must include a url."),
    body("colors").optional().isArray().withMessage("Colors must be an array."),
    body("colors.*").optional().trim().notEmpty().withMessage("Colors cannot be empty."),
    body("sizes").optional().isArray().withMessage("Sizes must be an array."),
    body("sizes.*").optional().trim().notEmpty().withMessage("Sizes cannot be empty."),
  ],
  validateRequest,
  updateProduct
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  [param("id").isMongoId().withMessage("A valid product id is required.")],
  validateRequest,
  deleteProduct
);

module.exports = router;
