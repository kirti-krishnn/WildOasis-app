import express from 'express';
import authController from '../controllers/authController.ts';
import {
  getAllCabins,
  getCabin,
  createCabin,
  updateCabin,
  deleteCabin,
} from '../controllers/cabinController.ts';
import { validateUpdateFields } from '../utils/validateUpdateFields.ts';


import { uploadCabinImage } from "../middleware/uploadCabinImage.ts";
import { setCabinImagePath } from "../middleware/setCabinImagePath.ts";

const router = express.Router();

router.get('/', getAllCabins);
router.get('/:id', getCabin);

router.use(authController.protectedRoute);
router.use(authController.restrictTo('admin'));
router.post('/',
  uploadCabinImage,
  setCabinImagePath,
  createCabin
);
router.patch(
  '/:id',
  uploadCabinImage,
  setCabinImagePath,
  validateUpdateFields(['name', 'description', 'maxCapacity', 'regularPrice', 'discount', 'image']),
  updateCabin
);
router.delete('/:id', deleteCabin);

export default router;



