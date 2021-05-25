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
    orders:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Order'
    }]
})

const UserModel = mongoose.model('User', UserSchema)
module.exports = UserModel