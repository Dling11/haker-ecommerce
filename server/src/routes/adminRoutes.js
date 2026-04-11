const express = require("express");

const { getDashboardStats } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getDashboardStats);

module.exports = router;
