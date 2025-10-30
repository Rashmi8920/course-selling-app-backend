import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";


import courseRoute from "./routes/course.route.js";
import userRoute from "./routes/user.route.js";
import adminRoute from './routes/admin.route.js'
import orderRoute from './routes/order.route.js' 

import cors from "cors"
import fileUpload from "express-fileupload";
import cookieParser from 'cookie-parser';

const app = express();
dotenv.config();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

app.use(cors({
  origin:["http://localhost:5173",
          "https://course-selling-app-uxpq.onrender.com"],  
  //live frontend url
  credentials:true,
  method:["POST","GET","PUT","DELETE"],
  allowedHeaders:["content-type","Authorization"],
  exposedHeaders:["Authorization"],
  optionSuccessstatus:200,
}))

// cookie setup fix
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://course-selling-app-uxpq.onrender.com");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const DB_URI = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};
connectDB();

app.get("/", (req, res) => {
  res.send("course app mern");
});

// routes define
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/user", userRoute);
app.use('/api/v1/admin',adminRoute);
app.use('/api/v1/order',orderRoute)

//cloudinary configuration code
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`port is run on ${PORT}`);
});




