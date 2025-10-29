import express from "express";
import { getUserProfile, login, logout, purchases, signUp } from "../controllers/user.controller.js";
import userMiddleWare from "../middleware/user.mid.js";


const router = express.Router();

router.post("/signup",signUp);
router.post("/login",login);
router.get("/logout",logout);
router.get("/purchases",userMiddleWare,purchases)     // router.get("/purchases",purchases)
router.get("/profile", userMiddleWare, getUserProfile);
export default router;
