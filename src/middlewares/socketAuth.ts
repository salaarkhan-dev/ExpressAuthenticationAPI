import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import cookie from "cookie";
import User from "../models/User";

const isAuthenticatedConnection = async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  next: any
) => {
  const { token } = cookie.parse(socket.request.headers.cookie || "");
  if (!token) {
    return next("Login first to get access to the resources");
  }
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
  const user = await User.findById(decoded["id"]);
  if (!user) {
    return next("Login first to get access to the resources");
  }

  socket.user = user;
  next();
};

export default isAuthenticatedConnection;
