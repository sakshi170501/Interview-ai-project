const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        unique:[true,"username already taken"],
        required:true,
        trim:true,
        minlength:2,
        maxlength:40,

    },
    email:{
        type:String,
        unique:[true,"Account already exists with this email address"],
        required:true,
        trim:true,
        lowercase:true,
        maxlength:254,
    },
    password:{
        type:String,
        required:true
    }

})
const userModel=mongoose.model("users",userSchema)
module.exports=userModel