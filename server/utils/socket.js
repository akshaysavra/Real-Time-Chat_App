// socket.js (minimal changes from your original)
// Adds socket.join(userId) so you can emit to a user's room with io.to(userId).emit(...)

import { Server } from "socket.io";

const userSocketMap = {}; // maps userId -> socketId (single-socket per user, same as your original)
let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected to server.", socket.id);
    console.log("Client connected with userId:", socket.handshake.query.userId);

    // try query userId (same as your original)
    const userId = socket.handshake.query.userId;

    if (userId) {
      // store socket id (same as your original behavior)
      userSocketMap[userId] = socket.id;

      // MINIMAL CHANGE: join a room named by the userId
      // This allows using io.to(userId).emit(...) to target that user.
      socket.join(userId);
    }

    // broadcast online users (same as original)
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("Client disconnected from server.", socket.id);
      // remove mapping for this userId (same as original)
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export { io };











// import {Server} from "socket.io";
// import cors  from 'cors';

// const userSocketMap = {};

// let io;
// export function initSocket(server){
//     io = new Server(server,{
//         cors: {
//             origin: [process.env.FRONTEND_URL],
            
//         }
//     });

//     io.on("connection",(socket)=>{
//         console.log("New client connected to server.",socket.id); 
//         const userId = socket.handshake.query.userId;
//         if(userId) userSocketMap[userId] = socket.id;

//         io.emit("getOnlineUsers",Object.keys(userSocketMap));

//         socket.on("disconnect",()=>{
//             console.log("Client disconnected from server.",socket.id);
//             delete userSocketMap[userId];
//             io.emit("getOnlineUsers",Object.keys(userSocketMap))
//         });

// });
// }

// export function getReceiverSocketId(userId){
//     return userSocketMap[userId];
// };

// export {io};


