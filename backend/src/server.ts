import connectDB from "./configs/db";
import "dotenv/config";

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.log("Error: ", error);
  }
};

startServer();
