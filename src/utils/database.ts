import mongoose from "mongoose";

const connectDatabase = () => {
  const MONGODB_URL =
    process.env.NODE_ENV === "DEVELOPMENT"
      ? (process.env.MONGODB_URL_DEV as string)
      : (process.env.MONGODB_URL_PROD as string);
  mongoose
    .connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then((con) =>
      console.log(`\nMongoDB is connected to the host: ${con.connection.host}`)
    );
};

export default connectDatabase;
