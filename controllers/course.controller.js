import { Course } from "../models/course.model.js";
import {v2 as cloudinary} from "cloudinary";
import { Purchase } from "../models/purchase.model.js";
import Stripe from "stripe";
import config  from "../config.js";

export const createCourse = async (req, res) => {
  const adminId=req.adminId;
  const {title,price,description} = req.body;
  try{
    if(!title||!description||!price){
        return res.status(400).json({errorsa:"All filed are required"})
    }

   if(!req.files||Object.keys(req.files).length===0){
    return res.status(400).json({ errors:'no files uploaded'});
   }
const {image}=req.files;

   const allowedFormat=["image/png","image/jpeg"]
   if(!allowedFormat.includes(image.mimetype)){
    return res.status(400).json({errore:"invalid file format. only PNG and JPG are allowed"})
   }


//cloudinary code
const cloud_response= await cloudinary.uploader.upload(image.tempFilePath)
// console.log(cloud_response); 
if(!cloud_response||cloud_response.error){
 return res.status(400).json({errors:"error uploading file to cloudinary"})
}

 const courseData={
    title,
    description,
    price,
    image:{
        public_id:cloud_response.public_id,
        url:cloud_response.secure_url,
    },
        creatorId:adminId     //isi admin n course create kiya h
 };

 const course= await Course.create(courseData);
 res.json({
   message:"course created succeffuly", 
   course,
 })
  }catch(e){
    console.log(e)
    res.status(500).json({error:" error creating course"})
  }
};

export const updateCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;

  try {
    const courseSearch = await Course.findById(courseId);
    if (!courseSearch) {
      return res.status(404).json({ error: "Course not found" });
    }
    let newImageData = courseSearch.image; // default old image

    //  If new image is uploaded
    if (req.files && req.files.image) {
      const { image } = req.files;

      const cloud_response = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "courses",
      });
      newImageData = {
        public_id: cloud_response.public_id,
        url: cloud_response.secure_url,
      };
    }
    const updatedCourse = await Course.findOneAndUpdate(
      { _id: courseId
        , creatorId: adminId 
      },
      {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        image: newImageData,
      },
      { new: true }
    );
    // if (!updatedCourse) {
    //   return res.status(403).json({ errors: "Can't update, created by other admin" });
    // }
    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
     
    });
  } catch (error) {
    console.error(error, "error in updating course");
    res.status(500).json({ errors: "Error in course updating" });
  }
};

export const deleteCourse=async(req,res)=>{
  const adminId=req.adminId;
  const {courseId}=req.params;
  
  try {
    const course=await Course.findOneAndDelete({
      _id:courseId, 
       creatorId:adminId
    });
  //   if(!course){
  //  return res.status(404).json({message:"can't delete,  by other admin"})
  //   }
    res.status(200).json({message:"course  deleted succefully"})
  } catch (error) {
    console.log("error in coursse deleting",error)
    res.status(500).json({message:"error in deleting course"})
  }
}

export const getCourses=async(req,res)=>{
  try {
    const getCourses=await Course.find({});
     res.status(201).json({getCourses,message:"couse fetch successfully"})   
  } catch (error) {
    console.log(error,"error to get course")
    res.status(500).json({error:"error in getting course"})
  }
}

export const courseDetails=async(req,res)=>{
  const {courseId}=req.params;
try {
  const course=await Course.findById(courseId);
  if(!course){
   return res.status(404).json({error:"course not found"})
  }
  res.status(200).json({course})  
} catch (error) {
  console.log(error)
  res.status(500).json({error:"error in find paticular course details"})
}
}

//payment gateway code in buy controller
// const stripe=new Stripe(config.STRIPE_SECRET_KEY)

export const buyCourses=async(req,res)=>{ 
const {userId}=req;
const {courseId}=req.params;
try {
  const course=await Course.findById(courseId)
  if(!course){
    return res.status(404).json({errors:"course not found"});
  }
  const existingPurchase=await Purchase.findOne({userId,courseId})
  if(existingPurchase){
 return res.status(400).json({errors:"You has already purchase this course"})
  }
  //stripe payment code===================
  const amount=course.price /100
 if (!amount || isNaN(amount)) {
      return res.status(400).json({ errors: "Invalid course amount" });
    }

const paymentIntent=await stripe.paymentIntents.create({
  amount:amount,
  currency:"usd",   //usd
    // automatic_payment_methods: { enabled: true },
payment_method_types:["card"], 
});
  //  const newPurchase = new Purchase({
  //    userId,  courseId, purchaseDate: new Date()
  //   });
  // await newPurchase.save();
res.status(201).json({
  message:"Payment intent created and course purchased successfylly",
  // newPurchase,
  course,
  clientSecret:paymentIntent.client_secret,
});
} catch (error) {
  console.log(error,"error in course buy")
  res.status(500).json({errors:"error in course buy"});
}
}


const stripe = new Stripe(config.STRIPE_SECRET_KEY);

//  Create Payment Intent (no DB save here)
export const createPaymentIntent = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ errors: "Course not found" });
    }

    // Check if user already bought
    const existing = await Purchase.findOne({ userId, courseId });
    if (existing) {
      return res.status(400).json({ errors: "You already purchased this course" });
    }

    const amount =  Math.round(course.price *100); // Convert to paise for Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.status(200).json({
      message: "Payment Intent created",
      course,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: "Error creating payment intent" });
  }
};
