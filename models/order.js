// This is the format of the order given by the user

const mongoose = require('mongoose')
const OrderSchema = new mongoose.Schema({
    items:Object,
    price:Number,
    ordertype:{
        type:String,
        default:"Home delivery"
    },
    Customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    createdAT:{
        type:Date,
        default:Date.now
    }
})

const OrderModel = mongoose.model('Order', OrderSchema)
module.exports = OrderModel
