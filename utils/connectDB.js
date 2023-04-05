const dotenv = require("dotenv");

dotenv.config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log("MongoDB Connected");
    });
  } catch (err) {
    console.log(`Error in connecting to DB: ${err}`);
    process.exit(1);
  }
};

module.exports = connectDB;
