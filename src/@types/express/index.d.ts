import { Express } from "express";
import User, { IUser } from "../../models/User";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

declare global {
  namespace Express {
    interface Request {
      user: IUser;
      io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    }
  }
}
