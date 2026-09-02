import express from 'express';
import authController from '../controllers/authController.ts';
import {
  getAllGuests,
  getGuest,
  createGuest,
  updateGuest,
  deleteGuest,
} from '../controllers/guestsController.ts';

const router = express.Router();

router.use(authController.protectedRoute);

router.get('/', getAllGuests);
router.get('/:id', getGuest);

router.use(authController.restrictTo('admin'));
router.post('/', createGuest);
router.patch('/:id', updateGuest);
router.delete('/:id', deleteGuest);

export default router;


