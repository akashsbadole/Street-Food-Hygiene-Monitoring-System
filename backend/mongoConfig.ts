import { MongoClient } from "mongodb";

const MONGO_URI = "mongodb://localhost:27017"; // Replace with your MongoDB URI
const DATABASE_NAME = "streetFoodSafety"; // Replace with your database name

const client = new MongoClient(MONGO_URI);

export const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(DATABASE_NAME);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};
