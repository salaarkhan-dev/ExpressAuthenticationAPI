import { Schema, Document, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export enum Roles {
  admin = "admin",
  user = "user",
}

export interface Avatar {
  public_id: string;
  url: string;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  role?: Roles;
  email: string;
  password: string;
  avatar?: Avatar;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  getJwtToken(): string;
  comparePassword(passwordHash: string): boolean;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "Please enter your first name."],
      trim: true,
      maxLength: [20, "First name shouldn't exceed 20 characters."],
    },
    lastName: {
      type: String,
      required: [true, "Please enter your last name."],
      trim: true,
      maxLength: [20, "Last name shouldn't exceed 20 characters."],
    },
    role: { type: String, enum: Object.values(Roles), default: "user" },
    email: {
      type: String,
      unique: true,
      required: [true, "Please enter your email."],
      validate: [validator.isEmail, "Please enter valid email address."],
    },
    password: {
      type: String,
      required: [true, "Please enter your password."],
      minLength: [6, "Password must have at least 6 characters."],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Encrypt the password before saving it.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 10);
});

// Return JWT Token.
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};
// Compare password and return boolean.
userSchema.methods.comparePassword = async function (passwordHash: string) {
  return await bcrypt.compare(passwordHash, this.password);
};

export default model<IUser>("User", userSchema);
