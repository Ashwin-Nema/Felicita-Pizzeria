// Basic model for storing user details

const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    mobile_number:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    location:{
        type:Array,
        default:[18.952163, 72.803736]
    },
    orders:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Order'
    }]
})

const UserModel = mongoose.model('User', UserSchema)
module.exports = UserModel