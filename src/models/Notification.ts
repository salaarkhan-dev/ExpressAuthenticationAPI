import { Schema, Document, model } from "mongoose";

export interface INotification extends Document {
  sender: Schema.Types.ObjectId;
  receiver: [Schema.Types.ObjectId];
  message: string;
  read: boolean;
  _doc: any;
}

const notificationSchema = new Schema<INotification>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    receiver: [{ type: Schema.Types.ObjectId, ref: "User" }],
    message: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<INotification>("Notification", notificationSchema);
