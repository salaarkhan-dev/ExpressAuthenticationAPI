import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import OnlineUser from "../models/OnlineUser";

const onConnection = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  try {
    const userExists = await OnlineUser.findOne({ user: socket.user._id });
    if (!userExists) {
      await OnlineUser.create({
        socketId: socket.id,
        user: socket.user._id,
      });
    } else {
      await userExists.updateOne({ $set: { socketId: socket.id } });
    }
    const onlineUsers = await OnlineUser.find({});
    socket.emit("onlineUsers", { onlineUsers });
  } catch (error) {
    console.log("error in onConnection", error);
  }

  socket.on("disconnect", async () => {
    await OnlineUser.findOneAndDelete({
      user: socket.user._id,
      socketId: socket.id,
    });
    const onlineUsers = await OnlineUser.find({});
    socket.emit("onlineUsers", { onlineUsers });
  });
};

export default onConnection;
