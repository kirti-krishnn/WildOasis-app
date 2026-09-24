import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import type { ErrorRequestHandler } from 'express';

import cabinRoutes from './routes/cabinRoutes.ts';
import bookingRoutes from './routes/bookingRoutes.ts';
import dashboardRoutes from './routes/dashboardRoutes.ts';
import guestRoutes from './routes/guestRoutes.ts';
import settingsRoutes from './routes/settingsRoutes.ts';
import userRoutes from './routes/userRoute.ts';
import AppError from './utils/appError.ts';
import { captureExpressError } from './utils/sentry.ts';
import path from 'path';
import { fileURLToPath } from 'url';

import Cabin from './models/cabinsModel.ts';

const app = express();

app.set('trust proxy', 1);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.basename(__dirname) === 'dist' ? path.resolve(__dirname, '..') : __dirname;
const uploadsPath = process.env.UPLOADS_PATH
  ? path.resolve(process.env.UPLOADS_PATH)
  : path.join(serverRoot, 'public', 'uploads');

const allowedOrigins = [
  ...(process.env.CLIENT_URL || 'http://localhost:5173').split(','),
  ...(process.env.CUSTOMER_URL || 'http://localhost:3000').split(','),
].map((origin) => origin.trim().replace(/\/$/, ''));

const corsOptions = {
  origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use(
  "/uploads",
  express.static(uploadsPath),
);

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Wild Oasis API is running.',
    health: '/api/v1/health',
  });
});

if (process.env.DISABLE_RATE_LIMIT !== 'true') {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/v1', apiLimiter);
}


/* app.get('/api/v1/health', async (req, res) => {
  const dbOk = mongoose.connection.readyState === 1;

  res.status(200).json({
    status: 'success',
    data: {
      ok: true,
      db: dbOk,
      env: process.env.NODE_ENV,
      dbName: mongoose.connection.name,
    },
  });
}); */


app.get('/api/v1/health', async (req, res) => {
  const dbOk = mongoose.connection.readyState === 1;

  const cabinCount = dbOk ? await Cabin.countDocuments() : 0;

  res.status(200).json({
    status: 'success',
    data: {
      ok: true,
      db: dbOk,
      env: process.env.NODE_ENV,
      dbName: mongoose.connection.name,
      cabinCount,
    },
  });
});


// Cabin routes
app.use('/api/v1/cabins', cabinRoutes);

// GET all guests
app.use('/api/v1/guests', guestRoutes);

// GET all bookings
app.use('/api/v1/bookings', bookingRoutes);

// Dashboard routes
app.use('/api/v1/dashboard', dashboardRoutes);

// Settings routes
app.use('/api/v1/settings', settingsRoutes);

// Auth and user routes
app.use('/api/v1/users', userRoutes);

app.use((req, res, next) => {
  void req;
  void res;
  next(new AppError('The requested resource was not found.', 404));
});

type MongooseLikeError = Error & {
  statusCode?: number;
  status?: string;
  code?: number;
  path?: string;
  value?: unknown;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
};

const handleMongooseValidationError = (err: MongooseLikeError) => {
  const errors = Object.values(err.errors || {}).map((el) => el.message).join('. ');
  return new AppError(errors || 'Validation failed.', 400);
};

const handleMongooseDuplicateFieldsDB = (err: MongooseLikeError) => {
  const value = err.keyValue ? JSON.stringify(err.keyValue) : 'duplicate field';
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleMongooseCastError = (err: MongooseLikeError) =>
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  void req;
  void next;
  console.error(err);

  let error = err as MongooseLikeError;

  if (error.name === 'ValidationError') {
    error = handleMongooseValidationError(error);
  }

  if (error.code === 11000) {
    error = handleMongooseDuplicateFieldsDB(error);
  }

  if (error.name === 'CastError') {
    error = handleMongooseCastError(error);
  }

  captureExpressError(error, req);

  res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message || 'Internal Server Error',
  });
};

app.use(globalErrorHandler);

export default app;



