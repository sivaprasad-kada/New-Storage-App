import mongoose from "mongoose";
const Schema = new mongoose.Schema({
    userId : {
        type : mongoose.Types.ObjectId,
        required : true
    },
    createdAt :{
        type : Date,
        default : Date.now,
        expires : 1000*60*10
    }
})
const sessionSchema = new mongoose.model("session",Schema);
export default sessionSchema