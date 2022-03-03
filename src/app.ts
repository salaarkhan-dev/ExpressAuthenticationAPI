import express, { Application } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import errorHandler from "./middlewares/errorHandler";
import routes from "./routes/index";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import onConnection from "./sockets";
import isAuthenticatedConnection from "./middlewares/socketAuth";
import cloudinary from "cloudinary";

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000", credentials: true },
});

// middlewares
app.use(helmet());
app.use((req, res, next) => {
  req.io = io;
  return next();
});
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Error Handler
app.use(errorHandler);
// Socket Auth Middleware
io.use(isAuthenticatedConnection);
// Sockets Connections
io.on("connection", onConnection);

export default httpServer;
