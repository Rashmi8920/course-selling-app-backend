import express from "express";
import {
  buyCourses,
  courseDetails,
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
  createPaymentIntent
} from "../controllers/course.controller.js";
import userMiddleWare from "../middleware/user.mid.js";
import adminMiddleWare from "../middleware/admin.mid.js";
// import {  } from "../controllers/courseController.js";

const router = express.Router();

router.post("/create",adminMiddleWare,createCourse);
router.put("/update/:courseId",adminMiddleWare,updateCourse);
router.delete("/delete/:courseId",adminMiddleWare,deleteCourse);

router.get("/courses",getCourses);
router.get("/:courseId",adminMiddleWare,courseDetails);  //get particular course

router.post("/buy/:courseId",userMiddleWare,buyCourses);
router.post("/create-payment-intent/:courseId", userMiddleWare, createPaymentIntent);

export default router;
