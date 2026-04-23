// connection to the MongoDB database using Mongoose ODM (Object Data Modeling) library. 
// It exports a function called connectDB that can be used to establish a connection to the database when the application starts. 
// The connection URI is retrieved from environment variables for security and flexibility.
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