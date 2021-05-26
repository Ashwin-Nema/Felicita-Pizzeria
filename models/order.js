const mongoose = require('mongoose')
const OrderSchema = new mongoose.Schema({
    items:Array,
    price:Number,
    Customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

const OrderModel = mongoose.model('Order', OrderSchema)
module.exports = OrderModel
