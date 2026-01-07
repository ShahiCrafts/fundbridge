
require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");

connectDB();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
