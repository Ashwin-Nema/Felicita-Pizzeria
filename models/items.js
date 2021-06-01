const mongoose = require('mongoose')
const ItemSchema = new mongoose.Schema({
    peppypaneerpizza:{
        type:Number,
        min:0,
        max:20
    },
    cheeseandcornpizza:{
        type:Number,
        min:0,
        max:20
    },
    chickensausagepizza:{
        type:Number,
        min:0,
        max:20
    },
    indiantandoorichickentikkapizza:{
        type:Number,
        min:0,
        max:20
    }
})

const ItemModel = mongoose.model('Items', ItemSchema)
module.exports = ItemModel
