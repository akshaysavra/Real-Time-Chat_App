import { catchAsyncError } from './../middleware/catchAsyncError.js';
import { User } from "../models/user.model.js";
import { Message } from "../models/message.modul.js";
import { v2 as cloudinary } from "cloudinary";
import { io } from "../utils/socket.js";

export const getAllusers = catchAsyncError(async (req, res, next) => {
    const user = req.user;
    const filteredUser = await User.find({ _id: { $ne: user } }).select("-password");
    return res.status(200).json({ success: true, users: filteredUser });
});

export const getMessages = catchAsyncError(async (req, res, next) => {
    const receiverId = req.params.id;
    const myId = req.user._id;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
        return res.status(401).json({ success: false, message: "Invalid Receiver Id." });
    }

    // ❌ WRONG FIELD: senderid
    // ✔ FIXED FIELD NAME
    const messages = await Message.find({
        $or: [
            { senderId: myId, receiverId: receiverId },       // FIX HERE
            { senderId: receiverId, receiverId: myId },       // FIX HERE
        ]
    }).sort({ createdAt: 1 });

    return res.status(200).json({ success: true, messages });
});

export const sendMessage = catchAsyncError(async (req, res, next) => {
  console.log("text in server mess controller" ,req.body)
    
    const media = req?.files?.media;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
        return res.status(401).json({ success: false, message: "Invalid Receiver Id." });
    }

    const senitizedText = (req.body?.text || "").trim();
    if (!senitizedText && !media) {
        return res.status(401).json({ success: false, message: "can not send empty message." });
    }

    let mediaUrl = "";
    if (media) {
        try {
            const uploadResponse = await cloudinary.uploader.upload(media.tempFilePath, {
                resource_type: "auto",
                folder: "CHAT_APP_MEDIA",
                transformation: [
                    { width: 1080, height: 1080, crop: "limit" },
                    { qulity: "auto" },
                    { fetch_format: "auto" },
                ]
            });
            mediaUrl = uploadResponse?.secure_url;
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Error In Uploading media to cloudinary",
                error: error,
            });
        }
    }

    // Create message
    const newMessage = await Message.create({
        senderId,
        receiverId,
        text: senitizedText,
        media: mediaUrl,
    });

    // ⭐ FIX: FETCH FULL MESSAGE WITH senderId & receiverId
    const fullMessage = await Message.findById(newMessage._id); // FIX HERE

    // ⭐ Emit same full message to receiver and sender
    io.to(receiverId).emit("newMessage", fullMessage); // FIX HERE
    io.to(senderId).emit("newMessage", fullMessage);   // FIX HERE

    console.log("EMITTING newMessage:", fullMessage);

    return res.status(201).json(fullMessage); // FIX HERE
});









// import { catchAsyncError } from './../middleware/catchAsyncError.js';
// import {User} from "../models/user.model.js";
// import {Message} from "../models/message.modul.js";
// import {v2 as cloudinary } from "cloudinary";
// import {io , getReceiverSocketId} from "../utils/socket.js";


// export const getAllusers = (catchAsyncError(async (req,res,next)=>{
//     const user = req.user;
//     const filteredUser = await User.find({_id : {$ne : user}}).select("-password");
//     return res.status(200).json({
//         success : true,
//         users : filteredUser,
//     })
// }));

// export const getMessages = (catchAsyncError(async (req,res,next)=>{
//     const receiverId = req.params.id;
//     const myId = req.user._id;

//     const receiver = await User.findById(receiverId);
//     if(!receiver){
//         return res.status(401).json({
//             success : false,
//             message : "Invalid Receiver Id."
//         })
//     }

//     const messages = await Message.find({
//         $or : [
//             {senderid : myId,receiverId : receiverId},
//             {senderid : receiverId,receiverId : myId},
            
//         ]
//     }).sort({createdAt : 1});

//     return res.status(200).json({
//         success : true,
//         messages,
//     })

// }));

// export const sendMessage = (catchAsyncError(async (req,res,next)=>{
//     // const {text} = req.body;
//     const media = req?.files?.media;
//     const {id : receiverId} = req.params;
//     const senderId = req.user._id;

//      const receiver = await User.findById(receiverId);
//     if(!receiver){
//         return res.status(401).json({
//             success : false,
//             message : "Invalid Receiver Id."
//         })
//     }

//     const senitizedText = req.body?.text.trim() || "";
//     if(!senitizedText && !media){
//         return res.status(401).json({
//             success : false,
//             message : "can not send empty message."
//         })
//     }

//     let mediaUrl = "";

//     if(media){
//         try {
//             const uploadResponse  = await cloudinary.uploader.upload(media.tempFilePath,{
//                 resource_type:"auto",
//                 folder : "CHAT_APP_MEDIA",
//                 transformation : [
//                     {width:1080 , height:1080 , crop:"limit"},
//                     {qulity : "auto"},
//                     {fetch_format : "auto"},
//                 ]
//             });

//             mediaUrl = uploadResponse?.secure_url;
//         } catch (error) {
//             return res.status(400).json({
//                 success : false,
//                 message : "Error In Uploading media to cloudinary",
//                 error : error,
//             })
//         }
//     }

//     const newMessage = await Message.create({
//         senderId,
//         receiverId,
//         text : senitizedText,
//         media : mediaUrl,
//     });

//     const senderSocketId = getReceiverSocketId(receiverId);
//     if(senderSocketId){
//         io.to(senderSocketId).emit("newMessageReceived",newMessage);
//     };
//     res.status(201).json({
//         newMessage
//     })

// }));