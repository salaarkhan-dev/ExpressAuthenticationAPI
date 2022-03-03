import dotenv from "dotenv";
import httpServer from "./app";
import connectDatabase from "./utils/database";
import cloudinary from "cloudinary";
// .env
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const port = process.env.PORT || 3000;
// Connect Database
connectDatabase();

const server = httpServer.listen(port || 3000, () => {
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
