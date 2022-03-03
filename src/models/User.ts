import { Schema, Document, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export enum Privacy {
  private = "private",
  public = "public",
}
export interface Avatar {
  public_id: string;
  url: string;
}

export interface IUser extends Document {
  fullname: string;
  bio?: string;
  email: string;
  followers?: [Schema.Types.ObjectId];
  followings?: [Schema.Types.ObjectId];
  username: string;
  privacy?: Privacy;
  password: string;
  avatar?: Avatar;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  _doc: any;
  getJwtToken(): string;
  comparePassword(passwordHash: string): boolean;
}

const userSchema = new Schema<IUser>(
  {
    fullname: {
      type: String,
      required: [true, "Please enter your full name."],
      trim: true,
      maxLength: [20, "Name shouldn't exceed 20 characters."],
    },
    bio: {
      type: String,
      trim: true,
      default: "",
      maxLength: [50, "Bio shouldn't exceed 50 characters."],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Please enter your email."],
      validate: [validator.isEmail, "Please enter valid email address."],
    },
    followers: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    followings: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    privacy: {
      type: String,
      enum: Object.values(Privacy),
      default: Privacy.public,
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Please enter your username."],
      trim: true,
      lowercase: true,
      validate: [validator.isSlug, "Please enter valid username."],
      minLength: [5, "Password must have at least 6 characters."],
      maxLength: [20, "Username shouldn't exceed 20 characters."],
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
