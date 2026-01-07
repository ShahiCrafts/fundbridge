const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
    });
    console.log(`[DATABASE] FundBridge connected to: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DATABASE ERROR] Connection failure.`);
    process.exit(1);
  }
};

module.exports = connectDB;
