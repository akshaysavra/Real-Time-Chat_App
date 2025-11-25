import mongoose from "mongoose";

const userScema = new mongoose.Schema({
   fullName : {
        type : String,
        require:true
    },

    email : {
        type:String,
        require:true
    },
    password : {
        type:String,
        require:true
    },
    avatar : {
        public_id : String,
        url:String
    }
    

},{timestamps:true}
)

export const User = mongoose.model("User",userScema);