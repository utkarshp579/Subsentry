const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI not found in .env file");
      console.log(
        "Please create .env file with MONGO_URI=mongodb://localhost:27017/subsentry"
      );
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("DB connected successfully");
  } catch (err) {
    console.log("DB connection error:", err);
  }
};

module.exports = connectDB;
