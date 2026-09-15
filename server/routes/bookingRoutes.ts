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

// Temporarily disabled while reservation fetching is being wired up.
// router.use(authController.protectedRoute);

router.get('/after-date/:date', getBookingByDate);
router.get('/stays-after-date/:date', getStaysByDate);
router.get('/stays-today-activity', getStaysTodayActivity);
router.get('/', getAllBookings);
router.get('/:id', getBooking);

// Temporarily disabled while authentication is paused.
// router.use(authController.restrictTo('admin'));
router.post('/', createBooking);
router.patch('/:id', updateBooking);
router.delete('/:id', deleteBooking);

export default router;


