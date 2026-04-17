const express = require("express");
const { body, param } = require("express-validator");

const { getDashboardStats } = require("../controllers/adminController");
const {
  getAdminNotifications,
  readAdminNotification,
  readAllAdminNotifications,
} = require("../controllers/notificationController");
const {
  getAdminSiteSettings,
  updateAdminSiteSettings,
} = require("../controllers/settingsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getDashboardStats);
router.get("/notifications", getAdminNotifications);
router.patch(
  "/notifications/read-all",
  readAllAdminNotifications
);
router.patch(
  "/notifications/:id/read",
  [param("id").isMongoId().withMessage("A valid notification id is required.")],
  validateRequest,
  readAdminNotification
);
router.get("/settings", getAdminSiteSettings);
router.put(
  "/settings",
  [
    body("maintenanceMode").optional().isBoolean().withMessage("Maintenance mode must be true or false."),
    body("maintenanceMessage")
      .optional()
      .trim()
      .isLength({ min: 10, max: 300 })
      .withMessage("Maintenance message must be between 10 and 300 characters."),
    body("allowCustomerRegistration")
      .optional()
      .isBoolean()
      .withMessage("Customer registration toggle must be true or false."),
    body("allowCustomerLogin")
      .optional()
      .isBoolean()
      .withMessage("Customer login toggle must be true or false."),
    body("emailSystemEnabled")
      .optional()
      .isBoolean()
      .withMessage("Email system toggle must be true or false."),
    body("emailProvider")
      .optional()
      .isIn(["gmail", "resend"])
      .withMessage("Email provider must be either gmail or resend."),
    body("smsSystemEnabled")
      .optional()
      .isBoolean()
      .withMessage("SMS system toggle must be true or false."),
    body("allowCheckout").optional().isBoolean().withMessage("Checkout toggle must be true or false."),
    body("allowCashOnDelivery")
      .optional()
      .isBoolean()
      .withMessage("Cash on Delivery toggle must be true or false."),
    body("allowGCash").optional().isBoolean().withMessage("GCash toggle must be true or false."),
    body("allowReviews").optional().isBoolean().withMessage("Reviews toggle must be true or false."),
    body("allowWishlist").optional().isBoolean().withMessage("Wishlist toggle must be true or false."),
    body("allowCoupons").optional().isBoolean().withMessage("Coupons toggle must be true or false."),
    body("allowPoints").optional().isBoolean().withMessage("Points toggle must be true or false."),
    body("allowCollections").optional().isBoolean().withMessage("Collections toggle must be true or false."),
    body("allowHomepageBanners").optional().isBoolean().withMessage("Homepage banners toggle must be true or false."),
    body("pointsEarnRate").optional().isFloat({ min: 0 }).withMessage("Points earn rate must be zero or greater."),
    body("pointRedemptionValue").optional().isFloat({ min: 0 }).withMessage("Point redemption value must be zero or greater."),
  ],
  validateRequest,
  updateAdminSiteSettings
);

module.exports = router;
