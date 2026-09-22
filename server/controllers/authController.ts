import User from "../models/usersModel.ts";
import Guest from "../models/guestsModel.ts";
import type { UserDocument } from "../models/usersModel.ts";
import { catchAsync } from "../utils/catchAsync.ts";
import AppError from "../utils/appError.ts";
import jwt, { type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import Email from "../utils/email.ts";
import crypto from "crypto";
import { logger } from "../utils/logger.ts";

interface AuthTokenPayload extends JwtPayload {
  id: string;
  sessionVersion?: number;
  type?: string;
}

const getBearerToken = (req: Request) => {
  const authorization = req.headers.authorization;
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
};

const getCookieValue = (cookieHeader: string | undefined, name: string) => {
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const cookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : undefined;
};

const signToken = (user: UserDocument) => {
  const secret = process.env.JWT_SECRET as Secret;
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign({
    id: user._id,
    sessionVersion: user.sessionVersion || 0,
  }, secret, options);
};

const createSendToken = (user: UserDocument, statusCode: number, res: Response) => {
  const token = signToken(user);
  const cookieExpiresIn = Number(process.env.JWT_COOKIE_EXPIRES_IN || 90);
  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  user.sessionVersion = undefined;

  res.status(statusCode).json({
    status: "success",
    data: {
      user,
    },
  });
};

const getClientURL = (req: Request) => {
  const clientURL = process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`;

  return clientURL.replace(/\/$/, "");
};

export const signup = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm  } = req.body || {};

  if (!name || !email || !password  || !passwordConfirm ) {
    throw new AppError(
      "Please provide your name, email, password, and password confirmation.",
      400,
    );
  }

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm, 
  });

  const url = `${getClientURL(req)}/tours`;
  try {
    await new Email(newUser, url).sendWelcome();
  } catch (err) {
    logger.warn("Welcome email could not be sent.", { error: err instanceof Error ? err.message : String(err) });
  }

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide your email and password.', 400));
    }

    const user = await User.findOne({ email }).select('+password +sessionVersion');
    if (!user || !user.password || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    } 

    createSendToken(user, 200, res);
});

export const logout = (req: Request, res: Response) => {
  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", "loggedout", cookieOptions);

  res.status(200).json({ status: "success" });
};

export const protectedRoute = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  else {
    token = req.cookies?.jwt || getCookieValue(req.headers.cookie, "jwt");
  }

    if (!token) {

    return next(new AppError('Please log in to access this page.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret) as AuthTokenPayload;
    const currentUser = await User.findById(decoded.id).select("+sessionVersion");

        if (!currentUser) { 
        return next(new AppError('Your session is no longer valid. Please log in again.', 401));
    }

    if ((decoded.sessionVersion || 0) !== (currentUser.sessionVersion || 0)) {
        return next(new AppError('Your session is no longer valid. Please log in again.', 401));
    }

    if(await currentUser.changedPasswordAfterToken(decoded.iat)) {
        return next(new AppError('Your password was recently changed. Please log in again.', 401));
    }
     
    req.user = currentUser;
    next();
});

export const customerLogin = catchAsync(async (req, res, next) => {
  const assertion = getBearerToken(req);
  const secret = process.env.CUSTOMER_AUTH_SECRET as Secret;

  if (!secret) {
    return next(new AppError("Customer authentication is not configured on the API.", 500));
  }

  if (!assertion) {
    return next(new AppError("Customer authentication token is missing.", 401));
  }

  let decoded: JwtPayload & { email?: string; type?: string };
  try {
    decoded = jwt.verify(assertion, secret) as JwtPayload & {
      email?: string;
      type?: string;
    };
  } catch {
    return next(new AppError("Invalid customer session.", 401));
  }

  if (decoded.type !== "customer" || !decoded.email) {
    return next(new AppError("Invalid customer session.", 401));
  }

  const email = decoded.email.trim().toLowerCase();
  let guest = await Guest.findOne({ email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } });

  if (!guest) {
    try {
      guest = await Guest.create({
        email,
        fullName: email.split("@")[0],
      });
    } catch (error) {
      if ((error as { code?: number })?.code !== 11000) throw error;
      guest = await Guest.findOne({ email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } });
    }
  }

  if (!guest) return next(new AppError("Could not create your guest account.", 500));

  let user = await User.findOne({ email }).select("+sessionVersion");
  if (!user) {
    const generatedPassword = crypto.randomBytes(32).toString("hex");
    user = await User.create({
      name: guest.fullName,
      email,
      password: generatedPassword,
      passwordConfirm: generatedPassword,
      role: "user",
    });
  }

  const token = signToken(user);

  res.status(200).json({ status: "success", data: { token, user } });
});

export const restrictTo = (...roles: Array<"user" | "admin">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Please log in to access this page.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403),
      );
    }
    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError('Please provide your email address.', 400));
  }

  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(200).json({
      status: 'success',
      message: 'If an account exists for this email, a reset link will be sent.',
    });
  } 

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${getClientURL(req)}/reset-password/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    logger.error("Password reset email could not be sent.", { error: err instanceof Error ? err.message : String(err) });

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('We could not send the email. Please try again later.', 500),
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body || {};

  if (!password || !passwordConfirm) {
    return next(new AppError('Please provide and confirm your new password.', 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match.', 400));
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(String(req.params.token))
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Your password reset link is invalid or has expired.", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Please log in to access this page.', 401));
  }

  const user = await User.findById(req.user.id).select('+password +sessionVersion');

  if (
    !user
    || !user.password
    || !(await user.correctPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError('Your current password is incorrect.', 401));
  }   
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  await user.save();
  createSendToken(user, 200, res);
});

export default{
  signup,
  login,
  customerLogin,
  logout,
  protectedRoute,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};



