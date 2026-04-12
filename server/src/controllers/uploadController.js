const streamifier = require("streamifier");
const { v2: cloudinary } = require("cloudinary");

const asyncHandler = require("../utils/asyncHandler");
const { deleteCloudinaryImage } = require("../utils/cloudinaryAsset");

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Image file is required.");
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    res.status(500);
    throw new Error("Cloudinary is not configured.");
  }

  const requestedFolder = req.body.folder || "haker-ecommerce/products";
  const folder =
    req.user?.role === "admin" ? requestedFolder : "haker-ecommerce/users";

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, uploadedFile) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(uploadedFile);
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  });

  res.status(201).json({
    success: true,
    message: "Image uploaded successfully.",
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
});

const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;

  if (!publicId) {
    res.status(400);
    throw new Error("Image public id is required.");
  }

  const isAdmin = req.user?.role === "admin";
  const isUserAsset = publicId.startsWith("haker-ecommerce/users/");
  const isProductAsset = publicId.startsWith("haker-ecommerce/products/");

  if (!isUserAsset && !isProductAsset) {
    res.status(403);
    throw new Error("You are not allowed to delete this image.");
  }

  if (!isAdmin && !isUserAsset) {
    res.status(403);
    throw new Error("You are not allowed to delete this image.");
  }

  await deleteCloudinaryImage(publicId);

  res.status(200).json({
    success: true,
    message: "Image deleted successfully.",
  });
});

module.exports = {
  deleteImage,
  uploadImage,
};
