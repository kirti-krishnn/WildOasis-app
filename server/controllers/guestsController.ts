import Guest from '../models/guestsModel.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import { getOne, updateOne, deleteOne } from './handlerFactory.ts';

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
export const updateGuest = updateOne(Guest);
export const deleteGuest = deleteOne(Guest);