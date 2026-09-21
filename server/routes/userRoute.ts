import authController from '../controllers/authController.ts';
import userController from '../controllers/usersControllers.ts';
import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts. Please wait a little before trying again.',
});

router.post('/signup', authController.signup);
router.post('/login', loginLimiter, authController.login); 
router.post('/customer-login', authController.customerLogin);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protectedRoute);

router.route('/me')
.get(userController.getMe, userController.getUser);

router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.delete("/deleteMe",  userController.deleteMe);

router.patch('/updatePassword', authController.updatePassword);  

router.use(authController.restrictTo('admin'));
router.route('/').
get(userController.getAllUsers).
post(userController.createUser);

router.route('/:id').
get(userController.getUser)
.patch(userController.updateUser)
.delete( userController.deleteUser);

export default router;


