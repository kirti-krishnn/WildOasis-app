// middleware/setCabinImagePath.ts

import type { Request, Response, NextFunction } from "express";

export function setCabinImagePath(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.file) {
    req.body.image = `/uploads/cabins/${req.file.filename}`;
  }

  next();
}