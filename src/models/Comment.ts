import { Schema, Document, model } from "mongoose";

export interface IComment extends Document {
  post: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  desc: string;
  likes: [Schema.Types.ObjectId];
  _doc: any;
}

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Please provide post ID."],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user ID."],
    },
    desc: {
      type: String,
      required: [true, "Please enter comment."],
      trim: true,
    },
    likes: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  { timestamps: true }
);

export default model<IComment>("Comment", commentSchema);
