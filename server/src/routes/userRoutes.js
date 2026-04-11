const express = require("express");
const { body, param } = require("express-validator");

const {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUserManagement,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", getUsers);
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("A valid user id is required.")],
  validateRequest,
  getUserById
);
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
    body("role")
      .optional()
      .isIn(["admin", "customer"])
      .withMessage("Role must be either admin or customer."),
    body("status")
      .optional()
      .isIn(["active", "inactive", "banned"])
      .withMessage("Status must be active, inactive, or banned."),
  ],
  validateRequest,
  createUser
);
router.put(
  "/:id/manage",
  [
    param("id").isMongoId().withMessage("A valid user id is required."),
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty."),
    body("email").optional().isEmail().withMessage("A valid email is required."),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
    body("role")
      .optional()
      .isIn(["admin", "customer"])
      .withMessage("Role must be either admin or customer."),
    body("status")
      .optional()
      .isIn(["active", "inactive", "banned"])
      .withMessage("Status must be active, inactive, or banned."),
  ],
  validateRequest,
  updateUserManagement
);
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("A valid user id is required.")],
  validateRequest,
  deleteUser
);

module.exports = router;
