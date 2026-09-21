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

router.get('/', getAllGuests);
router.get('/:id', getGuest);
router.post('/', createGuest);

router.patch('/:id', authController.protectedRoute, updateGuest);


router.use(authController.protectedRoute);
router.use(authController.restrictTo('admin'));

router.delete('/:id', deleteGuest);

export default router;


