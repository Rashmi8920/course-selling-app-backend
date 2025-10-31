import { User } from "../models/user.model.js";
import bcrypt from 'bcrypt'; 
import {z} from'zod';
import config from "../config.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import { Admin } from "../models/admin.model.js";
dotenv.config();

export const signUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  const adminSchema=z.object({
    firstName:z.string().min(3,{message:"firstname must be atleast 3 char long"}),
    lastName:z.string().min(3,{message:"lastname must be atleast 3 char long"}),
    email:z.string().email(),
    password:z.string().min(6,{message:"password must be atleast 6 char long"}),
  })

  const validation= adminSchema.safeParse(req.body);
  if(!validation.success){
    return res.status(400)
    .json({errors:validation.error.issues.map(err=>err.message)});  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin) {
      return res.status(400).json({ errors: "admin already exists" });
    }
    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newAdmin.save();
    res.status(210).json({ message: "signup successfull", newAdmin });
  } catch (error) {
    console.log(error, "error in admin signup");
    res.status(500).json({ error: "error in signup" });
  }
};

export const login=async(req,res)=>{
try {
  const {email,password}=req.body;

  const admin=await Admin.findOne({email:email});
   if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
  const isPasswordCorrect=await bcrypt.compare(password,admin.password);

  if(!admin||!isPasswordCorrect){
    return res.status(403).json({errors:"invalid credential!..."})
  }

//jwt code
const token=jwt.sign(
  { id:admin._id}, 
  config.JWT_ADMIN_PASSWORD,   
  { expiresIn: "90d" }      
);
res.cookie("jwt",token
          , {
  httpOnly: true,
  secure: true, // needed for HTTPS
  sameSite: "None" // allows cookies across domains
})
  res.status(201).json({message:"login successfull",admin,token})
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
    res.clearCookie("jwt", {
  httpOnly: true,
  secure: true,
  sameSite: "None",
});
  res.status(200).json({message:"logout successfully"});
  } catch (error) {
    console.log(error,"error in logut")
    res.status(500).json({error:"error in logout"});
  }

}

