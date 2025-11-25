import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

/**
 * getUsers: unchanged (returns res.data.users)
 * getMessages: returns { userId, messages } where messages is normalized (unwrap newMessage)
 * sendMessage: posts the message, normalizes the response and returns { userId, message } so reducer knows where to store it
 */

export const getUsers = createAsyncThunk("chat/getUsers", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/message/users");
    return res.data.users;
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    toast.error(msg);
    return thunkAPI.rejectWithValue(msg);
  }
});

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (userId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      // res.data.messages might be [{ newMessage: {...} }, ...] or plain messages
      const messages = (res.data.messages || []).map((m) => m?.newMessage || m);
      return { userId, messages };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

// sendMessage: returns { userId, message } where userId is the chat partner for reducer storage
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const selectedUser = state.chat.selectedUser;
      const authUser = state.auth?.authUser;
      if (!selectedUser?._id) {
        const msg = "No selected user to send message to";
        toast.error(msg);
        return thunkAPI.rejectWithValue(msg);
      }

      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );

      // Normalize server response: it might be { newMessage: {...} }, { message: {...} } or the message itself
      const normalized = res.data?.newMessage || res.data?.message || res.data;

      // Determine partnerId (the other user in the chat)
      // If authUser exists, partnerId is the id that's not authUser._id
      const currentUserId = authUser?._id;
      let partnerId = normalized.receiverId || normalized.senderId || selectedUser._id;

      if (currentUserId && normalized.senderId && normalized.receiverId) {
        partnerId = normalized.senderId === currentUserId ? normalized.receiverId : normalized.senderId;
      } else {
        // fallback: use selectedUser._id
        partnerId = selectedUser._id;
      }

      // Return both so reducer can directly insert into messagesByUser[partnerId]
      return { userId: partnerId, message: normalized };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messagesByUser: {}, // { [userId]: [messageObj, ...] }
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    loadingMessagesFor: null, // userId currently loading
    isSending: false,
    error: null,
  },
  reducers: {
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
    },
    // pushNewMessage expects { userId, message }
    pushNewMessage(state, action) {
      const { userId, message } = action.payload;
      if (!state.messagesByUser[userId]) state.messagesByUser[userId] = [];
      state.messagesByUser[userId].push(message);
    },
    // optional: replace optimistic temp message
    replaceTempMessage(state, action) {
      const { userId, tempId, message } = action.payload;
      const list = state.messagesByUser[userId] || [];
      const idx = list.findIndex((m) => m.tempId === tempId);
      if (idx !== -1) list[idx] = message;
    },
    // optional: clear cached messages for a user
    clearMessagesForUser(state, action) {
      const userId = action.payload;
      delete state.messagesByUser[userId];
    },
  },
  extraReducers: (builder) => {
    builder
      // getUsers
      .addCase(getUsers.pending, (state) => {
        state.isUsersLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.isUsersLoading = false;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isUsersLoading = false;
        state.error = action.payload || action.error?.message;
      })

      // getMessages
      .addCase(getMessages.pending, (state, action) => {
        state.loadingMessagesFor = action.meta.arg; // userId
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        const { userId, messages } = action.payload;
        state.messagesByUser[userId] = messages;
        state.loadingMessagesFor = null;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.loadingMessagesFor = null;
        state.error = action.payload || action.error?.message;
      })

      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        const { userId, message } = action.payload;
        if (!state.messagesByUser[userId]) state.messagesByUser[userId] = [];
        state.messagesByUser[userId].push(message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

export const { setSelectedUser, pushNewMessage, replaceTempMessage, clearMessagesForUser } = chatSlice.actions;
export default chatSlice.reducer;
