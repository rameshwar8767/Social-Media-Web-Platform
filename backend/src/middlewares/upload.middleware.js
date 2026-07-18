import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve("uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".mp4",
  ".webm",
  ".mov",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);
  const isExtAllowed = allowedExtensions.has(ext);

  if (!isMimeAllowed || !isExtAllowed) {
    return cb(
      new Error(
        "Invalid file type. Only image and video files are allowed."
      ),
      false
    );
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter,
});