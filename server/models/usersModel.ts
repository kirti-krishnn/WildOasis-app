import mongoose, { type HydratedDocument, type Model, type Query } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto"; 

export interface IUser {
  name: string;
  email: string;
  role: "user" | "admin";
  photo: string;
  password?: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  sessionVersion?: number;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active?: boolean;
}

export interface UserMethods {
  changedPasswordAfterToken(JWTTimestamp?: number): boolean;
  correctPassword(candidatePassword?: string, userPassword?: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

export type UserDocument = HydratedDocument<IUser, UserMethods>;
type UserModel = Model<IUser, {}, UserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, UserMethods>({
  name: {
    type: String,
    required: [true, "Please provide your name."],
    trim: true,
  },
    email: {
    type: String,
    required: [true, "Please provide your email address."],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address."],
  },
  role:{
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  photo: {
    type: String,
    default: "user-1.jpg",
  }, 
  password: {
    type: String,
    required: [true, "Please provide a password."],
    minlength: [8, "Password must be at least 8 characters."],
    select: false,  
    }, 
    passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password."],
    validate: {
        validator: function (this: UserDocument, val: string) {
        return val === this.password;
        },
        message: "Passwords do not match.",
    },
  }, 
  passwordChangedAt: Date,
  sessionVersion: {
    type: Number,
    default: 0,
    select: false,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
   },
});

 userSchema.methods.changedPasswordAfterToken = function (this: UserDocument, JWTTimestamp?: number) {
  if (!JWTTimestamp) return false;

  if (this.passwordChangedAt) {

    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

 userSchema.pre("save", async function (this: UserDocument) {
  if (!this.isModified("password")) return;
  if (!this.password) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
}); 
userSchema.pre(/^find/, function (this: Query<unknown, UserDocument>) {
  this.find({ active: { $ne: false } });
  
});

userSchema.methods.correctPassword = async function (candidatePassword?: string, userPassword?: string) {
  if (!candidatePassword || !userPassword) return false;

  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function (this: UserDocument) {
  const resetToken = crypto.randomBytes(32).toString("hex");  
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};
 
const User = mongoose.model<IUser, UserModel>("User", userSchema);

export default User;


