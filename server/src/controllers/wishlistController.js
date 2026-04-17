const User = require("../models/User");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const { getSiteSettings } = require("../utils/siteSettings");

const populateWishlist = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "wishlist",
    match: { isPublished: true },
  });

  return (user?.wishlist || []).filter(Boolean);
};

const getWishlist = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();

  if (!settings.allowWishlist) {
    res.status(403);
    throw new Error("Wishlist is currently disabled.");
  }

  const wishlist = await populateWishlist(req.user._id);

  res.status(200).json({
    success: true,
    wishlist,
  });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();

  if (!settings.allowWishlist) {
    res.status(403);
    throw new Error("Wishlist is currently disabled.");
  }

  const product = await Product.findOne({
    _id: req.params.productId,
    isPublished: true,
  }).select("_id");

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { wishlist: product._id },
  });

  const wishlist = await populateWishlist(req.user._id);

  res.status(200).json({
    success: true,
    message: "Added to wishlist.",
    wishlist,
  });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();

  if (!settings.allowWishlist) {
    res.status(403);
    throw new Error("Wishlist is currently disabled.");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { wishlist: req.params.productId },
  });

  const wishlist = await populateWishlist(req.user._id);

  res.status(200).json({
    success: true,
    message: "Removed from wishlist.",
    wishlist,
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
