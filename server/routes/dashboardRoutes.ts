import express from "express";
import authController from "../controllers/authController.ts";
import { getDashboardStats } from "../controllers/dashboardController.ts";

const router = express.Router();

router.use(authController.protectedRoute);

router.get("/stats", getDashboardStats);

export default router;
