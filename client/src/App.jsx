
// App.jsx
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

import { useEffect } from "react";
import { Loader } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getUser } from "./store/slices/authSlice";

import { connectSocket, getSocket } from "./lib/socket";   // ⭐ ADDED getSocket
import { setOnlineUsers } from "./store/slices/authSlice";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import NavBar from "./components/Navbar";

import { ToastContainer } from "react-toastify";

// ⭐ NEW: Import pushNewMessage
import { pushNewMessage } from "./store/slices/chatSlice";


const App = () => {
  const { authUser, isCheakingAuth } = useSelector((state) => state.auth);
  const dispatch = useDispatch();


  // ===============================================================
  //  FIX #1 — fetch user on mount
  // ===============================================================
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);   // ⭐ FIXED dependency (you had `[getUser]` which is wrong)



  // ===============================================================
  //  FIX #2 — connect socket when authUser exists
  // ===============================================================
  useEffect(() => {
    if (authUser?._id) {
      const socket = connectSocket(authUser._id);

      socket.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      return () => socket.disconnect();
    }
  }, [authUser, dispatch]);



  // ===============================================================
  //  ⭐⭐⭐ FIX #3 — GLOBAL NEW MESSAGE LISTENER (MOST IMPORTANT) ⭐⭐⭐
  // ===============================================================
  useEffect(() => {
    if (!authUser?._id) return;

    const socket = getSocket();
    if (!socket) return;

   const handleNewMessage = (payload) => {
  console.log("DEBUG: raw newMessage payload (App.jsx):", payload);
  const msg = payload?.newMessage || payload;
  console.log("DEBUG: normalized message:", msg);
  const partnerId = msg.senderId === authUser._id ? msg.receiverId : msg.senderId;
  console.log("DEBUG: determined partnerId:", partnerId);
  dispatch(pushNewMessage({ userId: partnerId, message: msg }));
};

    // ⭐ ATTACH listener ONCE globally
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [authUser, dispatch]);
  // ===============================================================
  //  END GLOBAL NEW MESSAGE LISTENER
  // ===============================================================



  if (isCheakingAuth && !authUser) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }


  return (
    <>
      <Router>
        <NavBar />
        <Routes>
          <Route
            path="/"
            element={authUser ? <Home /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/register"
            element={!authUser ? <Register /> : <Navigate to={"/"} />}
          />
          <Route
            path="/login"
            element={!authUser ? <Login /> : <Navigate to={"/"} />}
          />
          <Route
            path="/profile"
            element={authUser ? <Profile /> : <Navigate to={"/login"} />}
          />
        </Routes>
        <ToastContainer />
      </Router>
    </>
  );
};

export default App;









// import "./App.css";
// import "react-toastify/dist/ReactToastify.css";
// import { useEffect } from "react";
// import { Loader } from "lucide-react";
// import { useSelector,useDispatch } from "react-redux";
// import { getUser } from "./store/slices/authSlice";
// import { connectSocket } from "./lib/socket";
// import { setOnlineUsers } from "./store/slices/authSlice";
// import { BrowserRouter as Router,Routes,Route, Navigate } from "react-router-dom";
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Home from './pages/Home';
// import Profile from './pages/Profile';
// import { ToastContainer } from "react-toastify";
// import NavBar from "./components/NavBar";
// const App = () => {
//   const {authUser,isCheakingAuth} = useSelector((state => state.auth));
//   const dispatch = useDispatch();

//     useEffect(() =>{
//       dispatch(getUser());
//     },[getUser])

//     useEffect(() =>{
//       if(authUser){
//         const socket = connectSocket(authUser._id);

//         socket.on("getOnlineUsers",(users)=>{
//           dispatch(setOnlineUsers(users));
//         })

//         return () => socket.disconnect();

//       }
//     },[authUser])

//     if(isCheakingAuth && !authUser){
//       return (
//         <div className="w-full h-screen flex justify-center items-center">
//           <Loader className="animate-spin" size={40} />
//         </div>
//       );
//     }


//   return <>
//   <Router>
//     <NavBar/>
//     <Routes>
//       <Route path="/" element={authUser ? <Home/> : <Navigate to={"/login"}/>} />
//       <Route path="/register" element={!authUser ? <Register/> : <Navigate to={"/"}/>} />
//       <Route path="/login" element={!authUser ? <Login/> : <Navigate to={"/"}/>} />
//       <Route path="/profile" element={!authUser ? <Profile/> : <Navigate to={"/login"}/>} />
//     </Routes>
//     <ToastContainer />
//   </Router>
//   </>;
// };

// export default App;

