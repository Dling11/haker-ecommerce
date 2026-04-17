const express = require("express");
const { body, param } = require("express-validator");

const {
  getCollections,
  getFeaturedCollections,
  getCollectionBySlug,
  getAdminCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} = require("../controllers/collectionController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", getCollections);
router.get("/featured", getFeaturedCollections);
router.get("/admin", protect, adminOnly, getAdminCollections);
router.get("/:slug", getCollectionBySlug);
router.post(
  "/",
  protect,
  adminOnly,
  [body("name").trim().notEmpty().withMessage("Collection name is required.")],
  validateRequest,
  createCollection
);
router.put(
  "/:id",
  protect,
  adminOnly,
  [param("id").isMongoId().withMessage("A valid collection id is required.")],
  validateRequest,
  updateCollection
);
router.delete(
  "/:id",
  protect,
  adminOnly,
  [param("id").isMongoId().withMessage("A valid collection id is required.")],
  validateRequest,
  deleteCollection
);

module.exports = router;
