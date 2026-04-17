const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  {
    timestamps: true,
  }
);

const variantValueSchema = {
  type: [String],
  default: [],
  set: (values) =>
    [...new Set((values || []).map((value) => String(value || "").trim()).filter(Boolean))],
};

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: 3000,
    },
    brand: {
      type: String,
      trim: true,
      default: "Generic",
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    comparePrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: 0,
      default: 0,
    },
    images: {
      type: [imageSchema],
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one product image is required",
      },
    },
    colors: variantValueSchema,
    sizes: variantValueSchema,
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    numReviews: { type: Number, min: 0, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
