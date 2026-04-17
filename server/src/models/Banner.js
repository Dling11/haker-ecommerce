const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, default: "" },
    publicId: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: imageSchema,
      default: () => ({}),
    },
    ctaLabel: {
      type: String,
      trim: true,
      default: "",
    },
    ctaLink: {
      type: String,
      trim: true,
      default: "",
    },
    tone: {
      type: String,
      trim: true,
      default: "violet",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Banner", bannerSchema);
