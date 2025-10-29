import jwt from 'jsonwebtoken';
import config from '../config.js'
import dotenv from "dotenv";
dotenv.config();

function userMiddleWare(req,res,next){
    
    const authHeader=req.headers.authorization;

    if(!authHeader||!authHeader.startsWith("Bearer ")){
        return res.status(401).json({error:"no token provided"});
    }
    const token=authHeader.split(" ")[1];
    try {
        const  decoded=jwt.verify(token, process.env.JWT_USER_PASSWORD)
        req.userId=decoded.id;
        
        next();
    } catch (error) {
        return res.status(401).json({error:"invalid token or expired token"})
        console.log(error + "invalid token or expired token")
    }
}
export default userMiddleWare;