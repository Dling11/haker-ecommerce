const express = require("express");
const { body } = require("express-validator");

const { deleteImage, uploadImage } = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post("/image", protect, upload.single("image"), uploadImage);
router.delete(
  "/image",
  protect,
  [body("publicId").trim().notEmpty().withMessage("Image public id is required.")],
  validateRequest,
  deleteImage
);

module.exports = router;
