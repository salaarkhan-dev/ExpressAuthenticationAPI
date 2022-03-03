import { IUser } from "../../models/User";
import "socket.io";

declare module "socket.io" {
  interface Socket {
    user: IUser;
  }
}
