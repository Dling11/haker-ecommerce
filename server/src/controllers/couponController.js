const Coupon = require("../models/Coupon");
const asyncHandler = require("../utils/asyncHandler");
const { getSiteSettings } = require("../utils/siteSettings");

const calculateCouponDiscount = (coupon, subtotal) => {
  if (!coupon) {
    return 0;
  }

  if (coupon.discountType === "percentage") {
    return Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
  }

  return Math.min(Number(coupon.discountValue || 0), subtotal);
};

const resolveCouponByCode = async (code, subtotal) => {
  const normalizedCode = String(code || "").trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: normalizedCode });

  if (!coupon) {
    const error = new Error("Coupon not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!coupon.isActive) {
    const error = new Error("This coupon is inactive.");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    const error = new Error("This coupon has expired.");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    const error = new Error("This coupon has reached its usage limit.");
    error.statusCode = 400;
    throw error;
  }

  if (subtotal < coupon.minimumOrderAmount) {
    const error = new Error(
      `This coupon requires a minimum order of ${coupon.minimumOrderAmount}.`
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    coupon,
    discount: calculateCouponDiscount(coupon, subtotal),
  };
};

const getAdminCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    coupons,
  });
});

const validateCoupon = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();

  if (!settings.allowCoupons) {
    res.status(403);
    throw new Error("Coupons are currently disabled.");
  }

  const subtotal = Number(req.query.subtotal || 0);
  const { coupon, discount } = await resolveCouponByCode(req.query.code, subtotal);

  res.status(200).json({
    success: true,
    coupon,
    discount,
  });
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({
    code: req.body.code,
    description: req.body.description || "",
    discountType: req.body.discountType || "percentage",
    discountValue: Number(req.body.discountValue || 0),
    minimumOrderAmount: Number(req.body.minimumOrderAmount || 0),
    usageLimit: Number(req.body.usageLimit || 0),
    expiresAt: req.body.expiresAt || null,
    isActive: req.body.isActive !== false,
  });

  res.status(201).json({
    success: true,
    message: "Coupon created successfully.",
    coupon,
  });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found.");
  }

  Object.assign(coupon, {
    code: req.body.code ? String(req.body.code).trim().toUpperCase() : coupon.code,
    description: req.body.description ?? coupon.description,
    discountType: req.body.discountType ?? coupon.discountType,
    discountValue:
      req.body.discountValue !== undefined
        ? Number(req.body.discountValue || 0)
        : coupon.discountValue,
    minimumOrderAmount:
      req.body.minimumOrderAmount !== undefined
        ? Number(req.body.minimumOrderAmount || 0)
        : coupon.minimumOrderAmount,
    usageLimit:
      req.body.usageLimit !== undefined ? Number(req.body.usageLimit || 0) : coupon.usageLimit,
    expiresAt: req.body.expiresAt === "" ? null : req.body.expiresAt ?? coupon.expiresAt,
    isActive: req.body.isActive ?? coupon.isActive,
  });

  await coupon.save();

  res.status(200).json({
    success: true,
    message: "Coupon updated successfully.",
    coupon,
  });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found.");
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    message: "Coupon deleted successfully.",
  });
});

module.exports = {
  calculateCouponDiscount,
  resolveCouponByCode,
  getAdminCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
