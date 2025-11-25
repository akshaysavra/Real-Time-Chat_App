// components/ChatContainer.jsx
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMessages } from "../store/slices/chatSlice";

import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

const ChatContainer = () => {
  const { messagesByUser = {}, loadingMessagesFor, selectedUser } = useSelector(
    (state) => state.chat
  );
  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  // messages for currently selected user (cached)
  const messages = selectedUser ? messagesByUser[selectedUser._id] || [] : [];

  // fetch messages only when selectedUser changes and not cached
  useEffect(() => {
    if (!selectedUser?._id) return;
    if (!messagesByUser[selectedUser._id]) {
      dispatch(getMessages(selectedUser._id));
    }
    // no socket listeners here — they should be global (App.jsx)
  }, [dispatch, selectedUser?._id, messagesByUser]);

  // auto-scroll when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  function formatTimestamp(date) {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  if (loadingMessagesFor === selectedUser?._id) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <ChatHeader />
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages?.length > 0 ? (
          messages.map((message, index) => {
            // message is expected to be a normalized plain object
            const isSender = message.senderId === authUser?._id;
            const key =
              message._id ||
              message.id ||
              message.messageId ||
              message.tempId ||
              `${message.createdAt || Date.now()}-${index}`;

            return (
              <div
                key={key}
                className={`flex items-end ${isSender ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar (sibling) */}
                <div
                  className={`w-10 h-10 rounded-full overflow-hidden border shrink-0 ${
                    isSender ? "order-2 ml-3" : "order-1 mr-3"
                  }`}
                >
                  <img
                    className="w-full h-full object-cover"
                    src={
                      isSender
                        ? authUser?.avatar?.url || "/avatar-holder.avif"
                        : selectedUser?.avatar?.url || "/avatar-holder.avif"
                    }
                    alt="avatar"
                  />
                </div>

                {/* Bubble */}
                <div
                  ref={index === messages.length - 1 ? messagesEndRef : null}
                  className={`max-w-xs sm:max-w-sm md:max-w-md px-4 py-2 rounded-xl text-sm ${
                    isSender ? "bg-blue-400/20 text-black" : "bg-gray-200 text-black"
                  }`}
                >
                  {message.media && (
                    (message.media.includes?.(".mov") || message.media.includes?.(".webm")) ? (
                      <video src={message.media} className="w-full rounded-md mb-2" controls />
                    ) : (
                      <img src={message.media} alt="message-media" className="w-full rounded-md mb-2" />
                    )
                  )}

                  {message.text && <p>{message.text}</p>}
                  <span className="block text-[10px] mt-1 text-right text-gray-400">
                    {formatTimestamp(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400">No messages yet — say hello 👋</div>
        )}

        <div ref={messagesEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;

// import { useEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { getSocket } from "../lib/socket";
// import { getMessages } from "../store/slices/chatSlice";

// import MessageSkeleton from "./skeletons/MessageSkeleton";
// import MessageInput from "./MessageInput";
// import ChatHeader from "./ChatHeader";

// const ChatContainer = () => {
//   const { messages, isMessagesLoading, selectedUser } = useSelector(
//     (state) => state.chat
//   );
//   const { authUser } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     // console.log("selected user id in chatcontainer", selectedUser);
//     dispatch(getMessages(selectedUser?._id));
//   }, [selectedUser?._id]);

//   useEffect(() => {
//     if (messagesEndRef.current && messages) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   function formatTimestamp(date) {
//     return new Date(date).toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: false,
//     });
//   }

//   useEffect(() => {
//     if (!selectedUser?._id) return;
//     dispatch(getMessages(selectedUser._id));

//     const socket = getSocket();
//   }, [selectedUser?._id]);

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }
//   return (
//     <>
//       <div className="flex-1 flex flex-col overflow-hidden bg-white ">
//         <ChatHeader />
//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-6">
//           {console.log("messages in chatcontainer", messages)}
//           {messages.length > 0 &&
//             messages.map((message, index) => {
//               console.log("individual message", message);

//               const isSender = message.senderId === authUser._id;
//               return (
//                 <div
//                   key={ message._id || message.id || message.messageId || message.tempId || `${message.createdAt || Date.now()}-${index}`}
//                   className={`flex items-end ${
//                     isSender ? "justify-end" : "justify-start"
//                   }`}
//                   ref={index === messages.length - 1 ? messagesEndRef : null}
//                 >
//                   {/* AVATAR */}
//                   <div
//                     className={`w-10 h-10 rounded-full overflow-hidden border shrink-0 ${
//                       isSender ? "order-2 ml-3" : "order-1  mr-3"
//                     }`}
//                   >
//                     <img
//                       className="w-full h-full object-cover"
//                       src={isSender ? authUser?.avatar?.url || "/avatar-holder.avif" : selectedUser?.avatar?.url || "/avatar-holder.avif"}
//                       alt="/avatar-holder.avif"
//                     />

//                     {/* BUBBLE */}

                   
//                   </div>
//                    <div
//                       className={`max-w-xs sm:max-w-sm md:max-w-mdpx-4 py-2 rounded-xl text-sm  ${
//                         isSender
//                           ? "bg-blue-400/20 text-black order-1"
//                           : "bg-gray-200 text-black order-2"
//                       }`}
//                     >

//                       {
//                         message.media && (
//                           <>
//                           {
                            
//                          message.media.includes(".webm") || message.media.includes(".mov") || message.media.includes(".webm") ? (
//                             <video
//                               src={message.media} className="w-full rounded-md mb-2 " controls />) :(
//                                 <img
//                                 src={message.media}
//                                 alt="message-media"
                                
//                                 className="w-full rounded-md mb-2"
//                               />
//                             )
//                         }
//                             </>
//                         )
//                       }

//                       {message.text && <p>{message.text}</p>}
                      
//                       <span className="block text-[10px] mt-1 text-right text-gray-400">
//                         {formatTimestamp(message.createdAt)}
//                       </span>

//                     </div>
//                 </div>
//               );
//             })}
//         </div>
//         <MessageInput />
//       </div>
//     </>
//   );
// };

// export default ChatContainer;

