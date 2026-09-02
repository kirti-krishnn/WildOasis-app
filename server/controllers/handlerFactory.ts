import AppError from '../utils/appError.ts';
import type { NextFunction, Request, Response } from 'express';
import type { Model } from 'mongoose';

const filterObj = (obj: Record<string, unknown>, ...allowedFields: string[]) => {
  const newObj: Record<string, unknown> = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

export const getAll = <T>(Model: Model<T>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((field) => delete queryObj[field]);

    let query = Model.find(queryObj);

    if (req.query.sort) {
      query = query.sort(String(req.query.sort).split(',').join(' '));
    }

    if (req.query.fields) {
      query = query.select(String(req.query.fields).split(',').join(' '));
    }

    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.max(1, parseInt(String(req.query.limit), 10) || 100);
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const docs = await query;
    res.status(200).json({ status: 'success', results: docs.length, data: docs });
  } catch (err) {
    next(err);
  }
};

export const getOne = <T>(Model: Model<T>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Model.findById(req.params.id);
    if (!doc) return next(new AppError('Document not found', 404));
    res.status(200).json({ status: 'success', data: doc });
  } catch (err) {
    next(err);
  }
};

export const createOne = <T>(Model: Model<T>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: 'success', data: doc });
  } catch (err) {
    next(err);
  }
};

export const updateOne = <T>(Model: Model<T>, ...allowedFields: string[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filteredBody = allowedFields.length ? filterObj(req.body, ...allowedFields) : req.body;
    const doc = await Model.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError('Document not found', 404));
    res.status(200).json({ status: 'success', data: doc });
  } catch (err) {
    next(err);
  }
};

export const deleteOne = <T>(Model: Model<T>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('Document not found', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};



