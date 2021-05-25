const express = require('express')
const UserModel = require('../models/User')
const user_router = express.Router()
user_router.use(express.urlencoded({extended:true}))
user_router.post('/signup', (req, res) => {
    user = {name: "Ash",password:"ASJKK", mobile_number:8989441699,"email":"asjl"}
    const newuser = new UserModel(user)
    const finaluser = newuser.save()
    res.json(user)
})

module.exports = user_router