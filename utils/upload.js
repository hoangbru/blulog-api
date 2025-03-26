import multer from "multer";
import path from "path";
import fs from "fs";

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Folder where files will be stored
  },
  filename: (req, file, cb) => {
    const originalName = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    const extname = path.extname(file.originalname);
    const filePath = path.join("./uploads", originalName + extname);

    // Initialize arrays if not already done
    if (!req.existingFiles) req.existingFiles = [];
    if (!req.newFiles) req.newFiles = [];

    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      // Store existing file in req.existingFiles
      req.existingFiles.push(file.originalname);
    } else {
      req.newFiles.push(originalName + extname);
    }

    // Push to newFiles array and proceed with upload
    cb(null, originalName + extname);
  },
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max file size: 2MB
  fileFilter: fileFilter,
});

export default upload;
