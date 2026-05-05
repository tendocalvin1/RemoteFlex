// connection to the MongoDB database using Mongoose ODM (Object Data Modeling) library. 
// It exports a function called connectDB that can be used to establish a connection to the database when the application starts. 
// The connection URI is retrieved from environment variables for security and flexibility.
import mongoose from "mongoose";
import logger from "./logger.js";
import { MONGODB_URI } from "./env.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(MONGODB_URI);
    logger.info(`MongoDB connected! DB HOST: %s`, connectionInstance.connection.host);
  } catch (error) {
    logger.error("MongoDB connection failed!!! %O", error);
    process.exit(1);
  }
};

export default connectDB;