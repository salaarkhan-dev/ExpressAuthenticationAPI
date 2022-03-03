import { Schema, Document, model } from "mongoose";
import { Avatar } from "./User";

export interface IPost extends Document {
  user: Schema.Types.ObjectId;
  images: [Avatar];
  caption?: string;
  likes: [Schema.Types.ObjectId];
  comments: [Schema.Types.ObjectId];
  _doc: any;
}

const postSchema = new Schema<IPost>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user ID."],
    },
    images: {
      type: [
        {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
    },
    caption: {
      type: String,
      trim: true,
      default: "",
    },
    likes: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    comments: {
      type: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
  },
  { timestamps: true }
);

export default model<IPost>("Post", postSchema);
