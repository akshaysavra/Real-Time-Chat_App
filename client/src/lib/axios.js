import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "https://real-time-chat-app-1lm5.onrender.com/api/v1",
    withCredentials: true,
});



