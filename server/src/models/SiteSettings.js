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
