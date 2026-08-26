const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authroutes");
const userRoutes = require("./routes/userroutes");
const orderRoutes = require("./routes/orderroutes");
const productRoutes = require("./routes/productroutes");
const path = require("path");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });