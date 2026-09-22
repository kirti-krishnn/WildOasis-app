import Guest from '../models/guestsModel.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import { createOne, getOne, updateOne, deleteOne } from './handlerFactory.ts';
import AppError from '../utils/appError.ts';

export const getAllGuests = catchAsync(async (req, res) => {
  const query: Record<string, unknown> = {};

  if (req.query.email) {
    const email = String(req.query.email).trim();
    query.email = {
      $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
      $options: 'i',
    };
  }

  const guests = await Guest.find(query).lean();

  res.status(200).json({
    status: 'success',
    results: guests.length,
    data: guests,
  });
});

export const getGuest = getOne(Guest);
export const createGuest = createOne(Guest);
export const updateGuest = catchAsync(async (req, res, next) => {
  const customerEmail = req.user?.email;
  const guest = await Guest.findById(req.params.id).select('email');

  if (!guest) return next(new AppError('Document not found', 404));
  if (customerEmail && guest.email !== customerEmail) {
    return next(new AppError('You do not have permission to update this profile.', 403));
  }

  const updatedGuest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedGuest) return next(new AppError('Document not found', 404));
  res.status(200).json({ status: 'success', data: updatedGuest });
});
export const deleteGuest = deleteOne(Guest);