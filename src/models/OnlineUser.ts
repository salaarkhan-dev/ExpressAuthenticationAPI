import { Schema, Document, model } from "mongoose";

export interface IOnlineUser extends Document {
  user: Schema.Types.ObjectId;
  socketId: string;
  _doc: any;
}

const onlineUserSchema = new Schema<IOnlineUser>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    socketId: String,
  },
  { timestamps: true }
);

export default model<IOnlineUser>("OnlineUser", onlineUserSchema);
