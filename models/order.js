const mongoose = require('mongoose')
const OrderSchema = new mongoose.Schema({
    items:Object,
    price:Number,
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
