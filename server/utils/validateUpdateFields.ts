import type { NextFunction, Request, Response } from 'express';

export const validateUpdateFields =
  (allowedFields: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const requestedUpdates = Object.keys(req.body);
  const isValidOperation = requestedUpdates.every((field) =>
    allowedFields.includes(field)
  );

  if (!isValidOperation) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid update fields',
    });
  }

  next();
};


