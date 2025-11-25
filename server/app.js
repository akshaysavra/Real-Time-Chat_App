import express from "express";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import {config} from "dotenv";
import cors from "cors";
import dbConnection from "./database/db.js";
import userRoute from "./routes/user.routes.js";
import messageRoute from "./routes/message.routes.js"


config({path:'./config/config.env'})

const app = express();
app.use(cors({
    origin:process.env.FRONTEND_URL,
     credentials: true,
    methods:['GET','POST','PUT','DELETE'],
}))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"./temp/"
}))
dbConnection();

app.use("/api/v1/user",userRoute);
app.use("/api/v1/message",messageRoute);

export default app;