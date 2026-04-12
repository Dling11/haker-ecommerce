const express = require("express");

const { getPublicSiteSettings } = require("../controllers/settingsController");

const router = express.Router();

router.get("/public", getPublicSiteSettings);

module.exports = router;
