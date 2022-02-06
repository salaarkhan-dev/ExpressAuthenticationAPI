import express, { Application } from "express";
import errorHandler from "./middlewares/errorHandler";
import routes from "./routes/index";
import cookieParser from "cookie-parser";

const app: Application = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.use(errorHandler);
export default app;
