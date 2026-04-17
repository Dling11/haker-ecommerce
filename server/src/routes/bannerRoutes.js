const express = require("express");
const { body, param } = require("express-validator");

const {
  getPublicBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", getPublicBanners);
router.get("/admin", protect, adminOnly, getAdminBanners);
router.post(
  "/",
  protect,
  adminOnly,
  [
    body("title").trim().notEmpty().withMessage("Banner title is required."),
    body("image.url").notEmpty().withMessage("Banner image is required."),
  ],
  validateRequest,
  createBanner
);
router.put(
  "/:id",
  protect,
  adminOnly,
  [param("id").isMongoId().withMessage("A valid banner id is required.")],
  validateRequest,
  updateBanner
);
router.delete(
  "/:id",
  protect,
  adminOnly,
  [param("id").isMongoId().withMessage("A valid banner id is required.")],
  validateRequest,
  deleteBanner
);

module.exports = router;
