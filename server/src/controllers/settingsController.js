const asyncHandler = require("../utils/asyncHandler");
const { buildPublicSiteSettings, getSiteSettings } = require("../utils/siteSettings");

const getPublicSiteSettings = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();

  res.status(200).json({
    success: true,
    settings: buildPublicSiteSettings(settings),
  });
});

const getAdminSiteSettings = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();

  res.status(200).json({
    success: true,
    settings,
  });
});

const updateAdminSiteSettings = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();
  const nextValues = { ...req.body };

  Object.keys(nextValues).forEach((key) => {
    if (typeof nextValues[key] === "undefined") {
      delete nextValues[key];
    }
  });

  Object.assign(settings, nextValues, {
    updatedBy: req.user._id,
  });

  await settings.save();

  res.status(200).json({
    success: true,
    message: "Site settings updated successfully.",
    settings,
  });
});

module.exports = {
  getAdminSiteSettings,
  getPublicSiteSettings,
  updateAdminSiteSettings,
};
