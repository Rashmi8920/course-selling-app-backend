// import { User } from "../models/user.model.js";
import bcrypt from 'bcrypt'; 
import {z} from'zod';
import config from "../config.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import { Purchase } from "../models/purchase.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
dotenv.config();

export const signUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  const userSchema=z.object({
    firstName:z.string().min(3,{message:"firstname must be atleast 3 char long"}),
    lastName:z.string().min(3,{message:"lastname must be atleast 3 char long"}),
    email:z.string().email(),
    password:z.string().min(6,{message:"password must be atleast 6 char long"}),
  })

  const validation= userSchema.safeParse(req.body);
  if(!validation.success){
    return res.status(400)
    .json({errors:validation.error.issues.map(err=>err.message)}); 
   }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // const existingUser = await User.findOne({ email: email });
    // if (existingUser) {
    //   return res.status(400).json({ errors: "user already exists" });
    // }
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(210).json({ message: "signup successfull", newUser });
  } catch (error) {
    console.log(error, "error in signup");
    res.status(500).json({ error: "error in signup" });
  }
};

//get user
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // from middleware (token)
    const user = await User.findById(userId).select("firstName lastName email createdAt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

export const login=async(req,res)=>{
const {email,password}=req.body;
try {
  const user=await User.findOne({email:email});
  const isPasswordCorrect=await bcrypt.compare(password,user.password);

  if(!user||!isPasswordCorrect){
    return res.status(403).json({errors:"invalid credential!..."})
  }

//jwt code
const token=jwt.sign(
  { id:user._id}, 
  config.JWT_USER_PASSWORD,   
  { expiresIn: "90d" }      
);
res.cookie("jwt",token, {
  httpOnly: true,
  secure: true, //  needed for HTTPS
  sameSite: "None" // allows cookies across domains
})
  res.status(201).json({message:"login successfull",user,token})
} catch (error) {
  console.log(error,"Erros")
  res.status(500).json({errors:"error in login"})
}
}

export const logout=async(req,res)=>{
  try {
    if(!req.cookies.jwt){
      return res.status(401).json({error:"kindly login first"});
    }
    res.clearCookie("jwt");
    res.status(200).json({message:"logout successfully"});
  } catch (error) {
    console.log(error,"error in logut")
    res.status(500).json({error:"error in logout"});
  }
}

export const purchases=async(req,res)=>{
  const userId=req.userId;
  try {
    const purchased=await Purchase.find({userId}) 
    let purchasedCourseId=[]
    for(let i=0;i<purchased.length;i++){
     purchasedCourseId.push(purchased[i].courseId)
    }
    const courseData= await Course.find({
      _id:{$in:purchasedCourseId}
      // “Find all documents whose _id is included in the array purchasedCourseId.”
     })

    res.status(200).json({purchased,courseData})
  } catch (error) {
    console.log(error,"error in purchase")
  }

}
