const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authroutes");
const userRoutes = require("./routes/userroutes");
const orderRoutes = require("./routes/orderroutes");
const productRoutes = require("./routes/productroutes");
const aiRoutes = require("./routes/airoutes");
const path = require("path");


const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://192.168.0.22:5173"
  ],
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);
app.use("/ai", aiRoutes);



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