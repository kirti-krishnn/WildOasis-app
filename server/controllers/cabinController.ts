import Cabin from '../models/cabinsModel.ts';
import AppError from '../utils/appError.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import { getAll, getOne, createOne, deleteOne } from './handlerFactory.ts';

export const getAllCabins = getAll(Cabin);
export const getCabin = getOne(Cabin);
export const createCabin = createOne(Cabin);

export const updateCabin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const cabin = await Cabin.findById(id);

  if (!cabin) {
    return next(new AppError('Cabin not found', 404));
  }

  Object.assign(cabin, req.body);
  await cabin.save();

  res.status(200).json({
    status: 'success',
    data: cabin,
  });
});

export const deleteCabin = deleteOne(Cabin);




