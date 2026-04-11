const express = require("express");
const { body, param } = require("express-validator");

const { getUsers, updateUserManagement } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", getUsers);
router.put(
  "/:id/manage",
  [
    param("id").isMongoId().withMessage("A valid user id is required."),
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

module.exports = router;
