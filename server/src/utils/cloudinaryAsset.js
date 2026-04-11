const { v2: cloudinary } = require("cloudinary");

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
  });
};

module.exports = {
  deleteCloudinaryImage,
};
