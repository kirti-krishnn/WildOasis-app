import express from 'express';
import authController from '../controllers/authController.ts';
import {
  getAllGuests,
  getGuest,
  createGuest,
  updateCustomerProfile,
  updateGuest,
  deleteGuest,
} from '../controllers/guestsController.ts';

const router = express.Router();

router.get('/', getAllGuests);
router.get('/:id', getGuest);
router.post('/', createGuest);

router.patch('/profile', updateCustomerProfile);

router.use(authController.protectedRoute);
router.use(authController.restrictTo('admin'));

router.patch('/:id', updateGuest);
router.delete('/:id', deleteGuest);

export default router;


