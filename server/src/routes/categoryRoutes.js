const express = require("express");
const { body, param } = require("express-validator");

const {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getCategories,
  updateCategory,
} = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", getCategories);
router.get("/admin", protect, adminOnly, getAdminCategories);
router.post(
  "/",
  protect,
  adminOnly,
  [body("name").trim().notEmpty().withMessage("Category name is required.")],
  validateRequest,
  createCategory
);
router.put(
  "/:id",
  protect,
  adminOnly,
  [
    param("id").isMongoId().withMessage("A valid category id is required."),
    body("name").optional().trim().notEmpty().withMessage("Category name is required."),
  ],
  validateRequest,
  updateCategory
);
router.delete(
  "/:id",
  protect,
  adminOnly,
  [param("id").isMongoId().withMessage("A valid category id is required.")],
  validateRequest,
  deleteCategory
);

module.exports = router;
