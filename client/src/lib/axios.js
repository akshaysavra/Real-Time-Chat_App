import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "https://real-time-chat-app-backend-n0dd.onrender.com/api/v1",
    withCredentials: true,

});

