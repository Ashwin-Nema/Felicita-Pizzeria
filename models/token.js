const mongoose = require('mongoose')
const TokenSchema = new mongoose.Schema({
    userid:{
        type:String
    },
    token: {
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:3600
    }
})

const TokenModel = mongoose.model('Token', TokenSchema)
module.exports = TokenModel