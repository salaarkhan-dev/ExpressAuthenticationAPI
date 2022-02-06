import dotenv from "dotenv";
import app from "./app";
import connectDatabase from "./utils/database";
// .env
dotenv.config();

const port = process.env.PORT || 3000;
// Connect Database
connectDatabase();

const server = app.listen(port || 3000, () => {
  console.log(
    `\nServer Running on PORT ${port} in ${process.env.NODE_ENV} Mode.`
  );
});

// Unhandled Rejection
process.on("unhandledRejection", (err: Error) => {
  console.log(`ERROR: ${err.message}`);
  console.log(`SHUTTING SERVER DOWN! Due to Unhandled Promise Rejection.`);
  server.close(() => {
    process.exit(1);
  });
});
