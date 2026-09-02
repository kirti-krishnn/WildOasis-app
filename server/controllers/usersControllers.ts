import { catchAsync } from "../utils/catchAsync.ts";
import User from "../models/usersModel.ts";
import { deleteOne, getOne, getAll, createOne, updateOne } from "./handlerFactory.ts";
import AppError from "../utils/appError.ts";
import multer from "multer";
import type { FileFilterCallback } from "multer";
import type { NextFunction, Request, Response } from "express";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userImagesPath = process.env.USER_PHOTOS_PATH
  ? path.resolve(process.env.USER_PHOTOS_PATH)
  : path.join(__dirname, "../../client/public/users");

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  void req;
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Please upload only images."));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

export const getAllUsers = getAll(User);

export const uploadUserPhoto = upload.single("photo");
export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  if (!req.user) {
    return next(new AppError("Please log in to access this page.", 401));
  }

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  const image = sharp(req.file.buffer);
  const metadata = await image.metadata();

  if (!metadata.format || !metadata.width || !metadata.height) {
    return next(new AppError("Please upload a valid image file.", 400));
  }

  await image
    .resize(500, 500, {
      fit: "cover",
      position: "center",
    })
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(userImagesPath, req.file.filename));

  next();
});

export const getMe = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Please log in to access this page.", 401));
  }

  req.params.id = req.user.id;
  next();
});

export const getUser = getOne(User);

export const createUser = createOne(User);

export const updateUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("Please use the password endpoint to update passwords.", 400));
  }

  return updateOne(User, "name", "email", "role", "photo", "active")(req, res, next);
};

export const deleteUser = deleteOne(User);

export const updateMe = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Please log in to access this page.', 401));
  }

  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Please use the password endpoint to update passwords.', 400));
  }

  const filteredBody: {
    name?: string;
    email?: string;
    photo?: string;
  } = {};
  if (req.body.name) filteredBody.name = req.body.name;
  if (req.body.email) filteredBody.email = req.body.email;
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError('Please log in to access this page.', 401);
  }

  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export default {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  updateMe,
  deleteMe,
  deleteUser,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
};


