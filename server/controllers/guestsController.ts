import Guest from '../models/guestsModel.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import { getAll, getOne, createOne, updateOne, deleteOne } from './handlerFactory.ts';

export const getAllGuests = getAll(Guest);
export const getGuest = getOne(Guest);
export const createGuest = createOne(Guest);
export const updateGuest = updateOne(Guest);

export const deleteGuest = deleteOne(Guest);