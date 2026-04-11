const Product = require("../models/Product");
const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");
const { deleteCloudinaryImage } = require("../utils/cloudinaryAsset");

const buildSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword = "",
    category,
    minPrice,
    maxPrice,
    featured,
    sort = "newest",
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isPublished: true };

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { brand: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (featured === "true") {
    query.isFeatured = true;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    newest: { createdAt: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    nameAsc: { name: 1 },
  };

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const [products, totalProducts, categories] = await Promise.all([
    Product.find(query)
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(limitNumber),
    Product.countDocuments(query),
    Category.find({ isActive: true }).sort({ name: 1 }).select("name slug"),
  ]);

  res.status(200).json({
    success: true,
    products,
    categories,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNumber),
    },
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  res.status(200).json({
    success: true,
    product,
  });
});

const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product.");
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((sum, review) => sum + review.rating, 0) /
    product.reviews.length;

  await product.save();

  res.status(201).json({
    success: true,
    message: "Review submitted successfully.",
    product,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    slug: buildSlug(req.body.name),
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully.",
    product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  const updates = { ...req.body };
  const currentImagePublicIds = (product.images || [])
    .map((image) => image.publicId)
    .filter(Boolean);
  const nextImagePublicIds = (req.body.images || [])
    .map((image) => image.publicId)
    .filter(Boolean);

  if (req.body.name) {
    updates.slug = buildSlug(req.body.name);
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  const removedImagePublicIds = currentImagePublicIds.filter(
    (publicId) => !nextImagePublicIds.includes(publicId)
  );

  await Promise.all(removedImagePublicIds.map(deleteCloudinaryImage));

  res.status(200).json({
    success: true,
    message: "Product updated successfully.",
    product: updatedProduct,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  const imagePublicIds = (product.images || [])
    .map((image) => image.publicId)
    .filter(Boolean);

  await product.deleteOne();
  await Promise.all(imagePublicIds.map(deleteCloudinaryImage));

  res.status(200).json({
    success: true,
    message: "Product deleted successfully.",
  });
});

const getAdminProducts = asyncHandler(async (req, res) => {
  const { keyword = "", status = "all", sort = "newest", page = 1, limit = 10 } = req.query;

  const query = {};

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { brand: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ];
  }

  if (status === "published") query.isPublished = true;
  if (status === "draft") query.isPublished = false;
  if (status === "featured") query.isFeatured = true;

  const sortMap = {
    newest: { createdAt: -1 },
    name_az: { name: 1 },
    price_high: { price: -1 },
    price_low: { price: 1 },
    stock_high: { stock: -1 },
  };

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const [products, totalProducts] = await Promise.all([
    Product.find(query)
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(limitNumber),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNumber),
    },
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  addProductReview,
};
