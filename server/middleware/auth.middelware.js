import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { catchAsyncError } from "./catchAsyncError.js";

export const isAuthenticated = catchAsyncError(async (req,res,next) =>{
    const {token} = req.cookies;
    
    if(!token){
        return res.status(401).json({
            success : false,
           message : "User Is Not Authenticated.Please Sign In Again."
        })
    }

    const decode = jwt.verify(token,process.env.JWT_SECRET_KEY);
    if(!decode){
        return res.status(401).json({
            success : false,
            
            message :  "Token Verification Failed.Please Sign In Again."
        })
    }
    // console.log("decode " , decode);

    const user = await User.findById(decode.id);
    req.user = user;
    
    next();
});