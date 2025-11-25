import { catchAsyncError } from "../middleware/catchAsyncError.js";
import bcrypt from "bcryptjs";
import {User} from "../models/user.model.js"
import { generateJwtToken } from "../utils/jwtToken.js";
import {v2 as cloudinary} from "cloudinary";

export const signup = catchAsyncError(async (req,res,next) =>{

    const {fullName,email,password} = req.body;
    if(!fullName || !email || !password){
        return res.status(400).json({
            success : false,
            message : "please ener complete detail.",
        });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({
            success : false,
            message : "please enter valid email.",
        });
    }

    if(password.trim().length < 8){
        return res.status(400).json({
            success : false,
            message : "password must be at least length 8.",
        });
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const isEmailAlreadyUsed = await User.findOne({email});

    if(isEmailAlreadyUsed){
        return res.status(400).json({
            success : false,
            message : "email is already used.",
        });
    }

    const user = await User.create({
        fullName,
        email,
        password : hashedPassword,
        avatar : {
            public_id : "",
            url : ""
        }
    })

    generateJwtToken(user,"user successfully created.",201,res); 
});

export const signin = catchAsyncError(async (req,res,next) =>{

    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            success : false,
            message : "enter compelete detail."
        })
    }

     const emailRegex = /^\S+@\S+\.\S+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({
            success : false,
            message : "please enter valid email.",
        });
    }
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({
                success : false,
                message : "Invalid Credential."
            });
    }

    const isSamePassword = await bcrypt.compare(password,user.password);
    if(!isSamePassword){
         return res.status(400).json({
                success : false,
                message : "Invalid Credential."
            });
    }

    generateJwtToken(user,"Login successfully",200,res);

});

export const signout = catchAsyncError(async (req,res,next) =>{
    return res.status(200).cookie("token","",{
         httpOnly : true,
        sameSite : "strict",
        maxAge:0,
        secure : process.env.NODE_ENV !== "devlopment" ? true: false,
    }).json({
         success : true,
        message : "user Logged out successfully"
        
    })
});

export const getUser = catchAsyncError(async (req,res,next) =>{
    const user = req.user;
    return res.status(200).json({
        success : true,
        user,
    })
});

export const updateProfile = catchAsyncError(async (req,res,next) =>{
    const {fullName,email} = req.body;
    if(fullName?.trim().length === 0 || email?.trim().length === 0){
        return res.status(401).json({
            success : false,
            message : "fullName and email can`t be empty."
        })
    }

    const avatar = req?.files?.avatar;
    let cloudnaryResponse;

    if(avatar){
        try {
            const oldAvatarPublicId =req?.user?.avatar?.public_id;
            if(oldAvatarPublicId && oldAvatarPublicId.length > 0){
                await cloudinary.uploader.destroy(oldAvatarPublicId)
            }

            cloudnaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath,{
                folder : "CHAT_APP_USERS_AVATAR",
                transformation : [
                {width:300,height:300,crop:"limit"},
                {qulity : "auto"},
                {fetch_format : "auto"},
                ]
            })
        } catch (error) {
            console.error("cloudinary upload error.",error);
             return res.status(401).json({
                success : false,
                message : "Failed to Upload Avatar.Please Try Again Later.",
            })
        }
    }

    const data = {
        fullName,
        email,
    }
    if(avatar && cloudnaryResponse?.public_id && cloudnaryResponse?.secure_url){
        data.avatar = {
            public_id : cloudnaryResponse.public_id,
            url : cloudnaryResponse.secure_url
        }
    }
    const user = await User.findByIdAndUpdate(req.user._id,data,{
        new : true,
        runValidators : true,
    })
    return res.status(200).json({
        success : true,
        message : "Profile Updated Successfully.",
        user,
    });
});
