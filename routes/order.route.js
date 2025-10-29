import express from "express";
import { getUserOrders, saveOrder } from "../controllers/order.controller.js";
 import userMiddleware from '../middleware/user.mid.js'

const router = express.Router();

router.post("/", userMiddleware, saveOrder);
router.get("/", userMiddleware, getUserOrders);

export default router;
