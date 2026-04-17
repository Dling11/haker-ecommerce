const Collection = require("../models/Collection");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const { getSiteSettings } = require("../utils/siteSettings");

const buildSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getCollections = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();

  if (!settings.allowCollections) {
    res.status(200).json({ success: true, collections: [] });
    return;
  }

  const collections = await Collection.find({ isActive: true })
    .populate("productIds")
    .sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    collections: collections.map((collection) => ({
      ...collection.toObject(),
      productIds: collection.productIds.filter((product) => product?.isPublished),
    })),
  });
});

const getFeaturedCollections = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();

  if (!settings.allowCollections) {
    res.status(200).json({ success: true, collections: [] });
    return;
  }

  const collections = await Collection.find({
    isActive: true,
    isFeatured: true,
  })
    .populate("productIds")
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(6);

  res.status(200).json({
    success: true,
    collections: collections.map((collection) => ({
      ...collection.toObject(),
      productIds: collection.productIds.filter((product) => product?.isPublished).slice(0, 4),
    })),
  });
});

const getCollectionBySlug = asyncHandler(async (req, res) => {
  const settings = await getSiteSettings();

  if (!settings.allowCollections) {
    res.status(404);
    throw new Error("Collections are currently disabled.");
  }

  const collection = await Collection.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate("productIds");

  if (!collection) {
    res.status(404);
    throw new Error("Collection not found.");
  }

  res.status(200).json({
    success: true,
    collection: {
      ...collection.toObject(),
      productIds: collection.productIds.filter((product) => product?.isPublished),
    },
  });
});

const getAdminCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find({})
    .populate("productIds", "name price images isPublished")
    .sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    collections,
  });
});

const createCollection = asyncHandler(async (req, res) => {
  const productIds = req.body.productIds || [];
  const validProductIds = await Product.find({ _id: { $in: productIds } }).distinct("_id");

  const collection = await Collection.create({
    name: req.body.name,
    slug: buildSlug(req.body.name),
    description: req.body.description || "",
    image: req.body.image || { url: "", publicId: "" },
    isActive: req.body.isActive !== false,
    isFeatured: req.body.isFeatured === true,
    sortOrder: Number(req.body.sortOrder || 0),
    productIds: validProductIds,
  });

  const populatedCollection = await Collection.findById(collection._id).populate(
    "productIds",
    "name price images isPublished"
  );

  res.status(201).json({
    success: true,
    message: "Collection created successfully.",
    collection: populatedCollection,
  });
});

const updateCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    res.status(404);
    throw new Error("Collection not found.");
  }

  if (req.body.name) {
    collection.name = req.body.name;
    collection.slug = buildSlug(req.body.name);
  }

  if (req.body.description !== undefined) {
    collection.description = req.body.description;
  }

  if (req.body.image) {
    collection.image = req.body.image;
  }

  if (req.body.isActive !== undefined) {
    collection.isActive = req.body.isActive;
  }

  if (req.body.isFeatured !== undefined) {
    collection.isFeatured = req.body.isFeatured;
  }

  if (req.body.sortOrder !== undefined) {
    collection.sortOrder = Number(req.body.sortOrder || 0);
  }

  if (Array.isArray(req.body.productIds)) {
    const validProductIds = await Product.find({ _id: { $in: req.body.productIds } }).distinct(
      "_id"
    );
    collection.productIds = validProductIds;
  }

  await collection.save();

  const populatedCollection = await Collection.findById(collection._id).populate(
    "productIds",
    "name price images isPublished"
  );

  res.status(200).json({
    success: true,
    message: "Collection updated successfully.",
    collection: populatedCollection,
  });
});

const deleteCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    res.status(404);
    throw new Error("Collection not found.");
  }

  await collection.deleteOne();

  res.status(200).json({
    success: true,
    message: "Collection deleted successfully.",
  });
});

module.exports = {
  getCollections,
  getFeaturedCollections,
  getCollectionBySlug,
  getAdminCollections,
  createCollection,
  updateCollection,
  deleteCollection,
};
