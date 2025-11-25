import mongoose from "mongoose";

 const  dbConnection = () =>{
    mongoose.connect(process.env.MONGO_URI,{
        dbName:"ChatApp"
    })
    .then(()=>{
        console.log("Connected Successfully");
        
    })
    .catch((err)=>{
        console.log(`error connecting to db  ${err.message || err}`);
    })
}

export default dbConnection;