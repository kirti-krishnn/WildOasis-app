import Guest from '../models/guestsModel.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import { getOne, updateOne, deleteOne } from './handlerFactory.ts';
import AppError from '../utils/appError.ts';

export const getAllGuests = catchAsync(async (req, res) => {
  const query: Record<string, unknown> = {};

  if (req.query.email) {
    query.email = String(req.query.email);
  }

  const guests = await Guest.find(query).lean();

  res.status(200).json({
    status: 'success',
    results: guests.length,
    data: guests,
  });
});

export const getGuest = getOne(Guest);

export const createGuest = catchAsync(async (req, res) => {
  const guest = await Guest.create(req.body);

  res.status(201).json({
    status: 'success',
    data: guest,
  });
});

export const updateCustomerProfile = catchAsync(async (req, res, next) => {
  const secret = req.headers['x-customer-api-secret'];

  if (!secret || secret !== process.env.CUSTOMER_API_SECRET) {
    return next(new AppError('Unauthorized.', 401));
  }

  const { email, nationality, nationalID, countryFlag } = req.body || {};

  if (!email) {
    return next(new AppError('Email is required.', 400));
  }

  const guest = await Guest.findOneAndUpdate(
    { email },
    {
      nationality,
      nationalID,
      countryFlag,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!guest) {
    return next(new AppError('Guest not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: guest,
  });
});

export const updateGuest = updateOne(Guest);

export const deleteGuest = deleteOne(Guest);