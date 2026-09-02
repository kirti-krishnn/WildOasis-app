import express from 'express';
import authController from '../controllers/authController.ts';
import {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingByDate,
  getStaysByDate,
  getStaysTodayActivity,
} from '../controllers/bookingsController.ts';

const router = express.Router();

router.use(authController.protectedRoute);

router.get('/after-date/:date', getBookingByDate);
router.get('/stays-after-date/:date', getStaysByDate);
router.get('/stays-today-activity', getStaysTodayActivity);
router.get('/', getAllBookings);
router.get('/:id', getBooking);

router.use(authController.restrictTo('admin'));
router.post('/', createBooking);
router.patch('/:id', updateBooking);
router.delete('/:id', deleteBooking);

export default router;


