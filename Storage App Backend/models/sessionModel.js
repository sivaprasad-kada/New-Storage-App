import mongoose from "mongoose";
const Schema = new mongoose.Schema({
    userId : {
        type : mongoose.Types.ObjectId,
        required : true
    },
    // createdAt is mandatory for ttl doucments to implement auto delete functonality by the mongodb process
    createdAt :{
        type : Date,
        default : Date.now,
        expires : 1000*60*10
    }
})
const sessionSchema = new mongoose.model("session",Schema);
export default sessionSchema