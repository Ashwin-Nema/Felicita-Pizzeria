const express = require('express')
const { verify_email, verify_mobile_number } = require('../middlewares/verification')
const UserModel = require('../models/User')
const user_router = express.Router()
user_router.use(express.urlencoded({ extended: true }))
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const { DATABASE, SESSIONSECRET, SESSION } = process.env
const bcrypt = require('bcrypt')
const store = new MongoDBStore({
    uri:DATABASE,
    collection:SESSION
})

user_router.use(session({
    secret:SESSIONSECRET,
    resave:false,
    saveUninitialized:false,
    store:store
}))

user_router.post('/signup', async (req, res) => {
    req.session.hello = true
    const verifyemail = await verify_email(req.body.email)
    const verifynumber = await verify_mobile_number(req.body.mobilenumber)
    if (!verifyemail || !verifynumber) return
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)
        req.body.password = hash
        const newuser = new UserModel(req.body)
        const finaluser = newuser.save()
        res.json(user)
        return
    } catch(error) {
        console.log(error)
    }
    res.send("hello")
})


user_router.post('/login', async (req, res)=> {
    try {
        const user = await UserModel.findOne({email:req.body.email})
        const isMatching = await 
    }
})

module.exports = user_router