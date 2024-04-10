import mongooose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
  try {
    mongooose.connection.on("connected", () => {
      console.log("connected to db");
    });

    mongooose.connection.on("error", (err): void => {
      console.log("Error while connecting to db", err);
    });

    await mongooose.connect(config.databaseUrl as string);
  } catch (error) {
    console.error("Failed to connect to db", error);
    process.exit(1);
  }
};

export default connectDB;
