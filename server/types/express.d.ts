import type { UserDocument } from '../models/usersModel.ts';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export {};
