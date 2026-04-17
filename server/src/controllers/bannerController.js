const Banner = require("../models/Banner");
const asyncHandler = require("../utils/asyncHandler");
const { getSiteSettings } = require("../utils/siteSettings");

const getPublicBanners = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();

  if (!settings.allowHomepageBanners) {
    res.status(200).json({ success: true, banners: [] });
    return;
  }

  const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    banners,
  });
});

const getAdminBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    banners,
  });
});

const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create({
    title: req.body.title,
    subtitle: req.body.subtitle || "",
    image: req.body.image || { url: "", publicId: "" },
    ctaLabel: req.body.ctaLabel || "",
    ctaLink: req.body.ctaLink || "",
    tone: req.body.tone || "violet",
    isActive: req.body.isActive !== false,
    sortOrder: Number(req.body.sortOrder || 0),
  });

  res.status(201).json({
    success: true,
    message: "Banner created successfully.",
    banner,
  });
});

const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error("Banner not found.");
  }

  Object.assign(banner, {
    title: req.body.title ?? banner.title,
    subtitle: req.body.subtitle ?? banner.subtitle,
    image: req.body.image || banner.image,
    ctaLabel: req.body.ctaLabel ?? banner.ctaLabel,
    ctaLink: req.body.ctaLink ?? banner.ctaLink,
    tone: req.body.tone ?? banner.tone,
    isActive: req.body.isActive ?? banner.isActive,
    sortOrder: req.body.sortOrder !== undefined ? Number(req.body.sortOrder || 0) : banner.sortOrder,
  });

  await banner.save();

  res.status(200).json({
    success: true,
    message: "Banner updated successfully.",
    banner,
  });
});

const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error("Banner not found.");
  }

  await banner.deleteOne();

  res.status(200).json({
    success: true,
    message: "Banner deleted successfully.",
  });
});

module.exports = {
  getPublicBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
