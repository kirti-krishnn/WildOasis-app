import express from 'express';
import authController from '../controllers/authController.ts';
import {
  createSettings,
  getSettings,
  updateSettings,
} from '../controllers/settingsController.ts';
import { validateUpdateFields } from '../utils/validateUpdateFields.ts';

const router = express.Router();

const settingsFields = [
  'maximumNights',
  'minimumNights',
  'breakfastPrice',
  'lunchPrice',
  'dinnerPrice',
  'maximumGuestsPerBooking',
];

router
  .route('/')
  .get(getSettings)
  .all(authController.protectedRoute)
  .post(authController.restrictTo('admin'), createSettings)
  .patch(
    authController.restrictTo('admin'),
    validateUpdateFields(settingsFields),
    updateSettings,
  );

export default router;
