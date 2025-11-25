import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

import { connectSocket, disconnectSocket } from "../../lib/socket";
import { toast } from "react-toastify";



export const getUser = createAsyncThunk("user/me",async (_,thunkAPI) =>{
    try {
        const res = await axiosInstance.get("user/me");
        console.log("res data from get user in client auth slice",res.data.user)
        connectSocket(res.data.user._id);
        return res.data.user;
    } catch (error) {
        console.log("Error in fetching  user:",error);
        return thunkAPI.rejectWithValue(error.response.data || "Error in fetching  user:" );
    }
}
);

export const logout = createAsyncThunk("user/sign-out",async (_,thunkAPI) =>{
    try {
         await axiosInstance.get("user/sign-out");
        disconnectSocket();
        return null;
    } catch (error) {
        console.log("Error in logging out user:",error);
        return thunkAPI.rejectWithValue(error.response.data || "Error in logging out user:" );
    }
}
);
export const login = createAsyncThunk("user/sign-in",async (data,thunkAPI) =>{
    try {
         const res = await axiosInstance.post("user/sign-in",data);
         console.log("res data from login in client auth slice",res.data)
        connectSocket(res.data._id);
        toast.success("Logged in successfully");
        return res.data;
    } catch (error) {
        console.log("Error in logging out user:",error);
        return thunkAPI.rejectWithValue(error.response.data || "Error in logging out user:" );
    }
}
);

export const register = createAsyncThunk("user/sign-up",async (data,thunkAPI) =>{
    try {
        const res = await axiosInstance.post("user/sign-up",data);
        // console.log("res data from register in client auth slice",res.data)
        connectSocket(res.data._id)
        toast.success("Registered successfully");
        return res.data;
    } catch (error) {
         console.log("Error in signing user:",error);
        return thunkAPI.rejectWithValue(error.response.data || "Error in signing user:" );
    }
})



const authSlice = createSlice({
    name : "auth",
    initialState : {
        authUser : null,
        isSigningIn : false,
        isSigningUp : false,
        isUpdatingProfile : false,
        isCheakingAuth : true,
        onlineUsers : [],
    },
    reducers : {
        setOnlineUsers(state,action){
            state.onlineUsers = action.payload;
        }
    },
    extraReducers : (builder) =>{
        builder.addCase(getUser.fulfilled,(state,action)=>{
            state.authUser = action.payload;
            state.isCheakingAuth = false;
        })
        .addCase(getUser.rejected,(state,action)=>{
            state.authUser = null;
            state.isCheakingAuth = false;
        }).addCase(logout.fulfilled,(state,action)=>{
            state.authUser = null;
        }).addCase(logout.rejected,(state,action)=>{
            // Handle logout error if needed
            state.authUser  =  state.authUser
        }).addCase(login.pending,(state,action)=>{
            state.isSigningIn = true;
        }).addCase(login.fulfilled,(state,action)=>{
            state.authUser = action.payload;
            state.isSigningIn = false;
        }).addCase(login.rejected,(state,action)=>{
            state.isSigningIn = false;
        }).addCase(register.pending,(state,action)=>{
            state.isSigningUp = true;
        }).addCase(register.fulfilled,(state,action)=>{
            state.authUser = action.payload;
            state.isSigningUp = false;
        }).addCase(register.rejected,(state,action)=>{
            state.isSigningUp = false;
        })

    }

});

export const {setOnlineUsers} = authSlice.actions;
export default authSlice.reducer;