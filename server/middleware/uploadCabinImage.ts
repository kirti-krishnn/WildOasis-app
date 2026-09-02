// middleware/uploadCabinImage.ts

import multer from "multer";
import path from "path";
import crypto from "crypto";
import AppError from "../utils/appError.ts";

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, "public/uploads/cabins");
  },

  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname);

    const filename = `cabin-${crypto.randomUUID()}${extension}`;

    callback(null, filename);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  callback,
) => {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
  } else {
    callback(
      new AppError("Please upload an image file.", 400),
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadCabinImage = upload.single("image");