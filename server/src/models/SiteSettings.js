const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      trim: true,
      default: "The shop is temporarily unavailable while we perform maintenance.",
    },
    allowCustomerRegistration: {
      type: Boolean,
      default: true,
    },
    allowCustomerLogin: {
      type: Boolean,
      default: true,
    },
    emailSystemEnabled: {
      type: Boolean,
      default: true,
    },
    emailProvider: {
      type: String,
      enum: ["gmail", "resend"],
      default: "resend",
    },
    smsSystemEnabled: {
      type: Boolean,
      default: false,
    },
    allowCheckout: {
      type: Boolean,
      default: true,
    },
    allowCashOnDelivery: {
      type: Boolean,
      default: true,
    },
    allowGCash: {
      type: Boolean,
      default: true,
    },
    allowReviews: {
      type: Boolean,
      default: true,
    },
    allowWishlist: {
      type: Boolean,
      default: true,
    },
    allowCoupons: {
      type: Boolean,
      default: true,
    },
    allowPoints: {
      type: Boolean,
      default: true,
    },
    allowCollections: {
      type: Boolean,
      default: true,
    },
    allowHomepageBanners: {
      type: Boolean,
      default: true,
    },
    pointsEarnRate: {
      type: Number,
      default: 1,
      min: 0,
    },
    pointRedemptionValue: {
      type: Number,
      default: 1,
      min: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
