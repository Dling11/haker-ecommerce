const streamifier = require("streamifier");
const { v2: cloudinary } = require("cloudinary");

const asyncHandler = require("../utils/asyncHandler");

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

module.exports = {
  uploadImage,
};
