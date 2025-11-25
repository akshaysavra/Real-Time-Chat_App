import {io} from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
    if (!userId) {
    console.warn("Tried connecting socket with EMPTY userId. Blocked.");
    return;
  }
    const cleanedUserId = String(userId);
  socket = io(
    import.meta.env.MODE === "development"
      ? "http://localhost:4000"
      : "/",
    {
      query: { userId: cleanedUserId } // <--- FORCE userId to be string
    }
  );

  socket.on("connect", () => {
    console.log("CLIENT SOCKET CONNECTED AS USER:", userId, "socket:", socket.id);
  });

  return socket;
};
export const getSocket = ()=>socket;

export const disconnectSocket = () =>{
    if(socket){
        socket.disconnect();
        socket = null;
    }
}