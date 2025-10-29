import express from "express";
import Order from "../models/order.model.js";
import {Purchase} from "../models/purchase.model.js";
import {Course} from "../models/course.model.js";

export const saveOrder = async (req, res) => {
  const { userId, courseId, paymentId, amount, status, email } = req.body;

  try {
    // verify payment success
    if (status !== "succeeded") {
      return res.status(400).json({ errors: "Payment not successful" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ errors: "Course not found" });

    const existingPurchase = await Purchase.findOne({ userId, courseId });
    if (existingPurchase) {
      return res.status(400).json({ errors: "Course already purchased" });
    }
  //  Save the order
    const order = new Order({
      userId,
      courseId,
      paymentId,
      amount:course.price,
      status,
      email,
      title: course.title,
    });
    await order.save();


  //  Save the purchase
    const purchase = new Purchase({
      userId,
      courseId,
      paymentId,
      amount:course.price,
      email,
      purchaseDate: new Date(),
      title: course.title,
    });

    await purchase.save();

    res.status(201).json({
      message: "Purchase and order saved successfully",
      order,
      purchase,
    });
  } catch (error) {
    console.error("Error saving purchase or order:", error);
    res.status(500).json({ errors: "Error saving order or purchase" });
  }
};

// for specific user
export const getUserOrders = async (req, res) => {
  const userId = req.userId;
  try {
    const orders = await Order.find({ userId }).populate("courseId", "title price");

    if (!orders || orders.length === 0) {
      return res.status(200).json({ message: "No orders found", orders: [] });
    }
    res.status(200).json({ message: "User orders fetched successfully", orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ errors: "Error fetching user orders" });
  }
};

