
import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(MONGODB_URI);
    console.log(`\n MongoDB connected !!! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection failed !!!", error);
    process.exit(1);
  }
};

export default connectDB;