const Category = require("../models/Category");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

const buildSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    categories,
  });
});

const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    categories,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    name: req.body.name,
    slug: buildSlug(req.body.name),
    description: req.body.description || "",
    isActive: req.body.isActive !== false,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully.",
    category,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found.");
  }

  const previousName = category.name;

  category.name = req.body.name || category.name;
  category.slug = req.body.name ? buildSlug(req.body.name) : category.slug;
  category.description = req.body.description ?? category.description;
  category.isActive = req.body.isActive ?? category.isActive;

  await category.save();

  if (req.body.name && req.body.name !== previousName) {
    await Product.updateMany({ category: previousName }, { category: req.body.name });
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully.",
    category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found.");
  }

  const productCount = await Product.countDocuments({ category: category.name });

  if (productCount > 0) {
    res.status(400);
    throw new Error("This category is still used by existing products.");
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully.",
  });
});

module.exports = {
  getCategories,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
