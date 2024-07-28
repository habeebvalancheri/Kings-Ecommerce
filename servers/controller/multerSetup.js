const multer = require("multer");
const path = require("path");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}-${file.originalname}`;
    cb(null, fileName);
  },
});

const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG|webp)$/)) {
    const error = new Error("Only image files are allowed!");
    error.status = 400;
    return cb(error, false);
  }
  cb(null, true);
};

// Multer middleware with configured storage and file filter
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
});

module.exports = upload;
