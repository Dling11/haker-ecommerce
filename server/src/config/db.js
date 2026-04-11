const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in the environment variables.");
  }

  const connection = await mongoose.connect(mongoUri, {
    dbName: "haker-ecommerce",
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
};

module.exports = connectDB;
