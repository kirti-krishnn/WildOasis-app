import express from 'express';
import authController from '../controllers/authController.ts';
import {
  getAllBookings,
  getCabinAvailability,
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
router.get('/availability/:cabinId', getCabinAvailability);
router.get('/', authController.protectedRoute, getAllBookings);
router.get('/:id', authController.protectedRoute, getBooking);

// Temporarily disabled while authentication is paused.
// router.use(authController.restrictTo('admin'));
router.post('/', authController.protectedRoute, createBooking);
router.patch('/:id', authController.protectedRoute, updateBooking);
router.delete('/:id', authController.protectedRoute, deleteBooking);

export default router;


