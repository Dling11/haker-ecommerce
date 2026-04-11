const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, and WEBP images are allowed."));
      return;
    }

    cb(null, true);
  },
});

module.exports = upload;
