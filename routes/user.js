const express = require('express')
const { verify_email, verify_mobile_number } = require('../middlewares/verification')
require('dotenv').config()
const UserModel = require('../models/User')
const user_router = express.Router()
user_router.use(express.urlencoded({ extended: true }))
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const { DATABASE, SESSIONSECRET, SESSION } = process.env
const bcrypt = require('bcrypt')
const axios = require('axios')
const OrderModel = require('../models/order')
const store = new MongoDBStore({
    uri: DATABASE,
    collection: SESSION
})

user_router.use(session({
    secret: SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
    store: store
}))

user_router.get('/', async (req, res) => {
    req.session.gotanorder = false
    if (req.session.user) {
        // let finaluser = await UserModel.findOne({_id:req.session.user._id})
        // let order = await OrderModel.findOne({_id: finaluser.orders[finaluser.orders.length - 1]})
        // let time = order.createdAT.getTime()
        
    }
    res.render('home', req.session.user)

})

user_router.get('/login', async (req, res) => {
    req.session.gotanorder = false
    if (req.session.isloggedin) {
        res.redirect("/")
        return
    }
    res.render('login')
})

user_router.get('/signup', (req, res) => {
    console.log(req.session)
    req.session.gotanorder = false
    console.log(req.session.finalorder)
    if (req.session.isloggedin) {
        res.redirect("/")
        return
    }
    res.render("signup")
})

user_router.post('/signup', async (req, res) => {
    req.session.gotanorder = false
    if (req.session.isloggedin) {
        res.redirect("/")
        return
    }

    const verifyemail = await verify_email(req.body.email)
    const verifynumber = await verify_mobile_number(req.body.mobile_number)
    if (!verifyemail || !verifynumber || req.body.password != req.body.confirmpassword) {
        res.render("signuperror")
        return
    }
    delete req.body.confirmpassword
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)
        req.body.password = hash
        const newuser = new UserModel(req.body)
        const finaluser = await newuser.save()
        req.session.isloggedin = true
        req.session.user = { _id: finaluser._id, name: finaluser.name, mobile_number: finaluser.mobile_number, email: finaluser.email}
        res.redirect("/")
        return
    } catch (error) {
        console.log(error)
    }
    res.render("signuperror")
})


user_router.post('/login', async (req, res) => {
    req.session.gotanorder = false
    if (!req.session.isloggedin) {
        try {
            const user = await UserModel.findOne({ email: req.body.email })
            const isMatching = await bcrypt.compare(req.body.password, user.password)
            if (user != null && isMatching) {
                req.session.isloggedin = true
                req.session.user = { _id: user._id, name: user.name, mobile_number: user.mobile_number, email: user.email}
                res.redirect("/")
                return
            }
        } catch (error) {
            console.log(error)
        }
        res.render('loginerror')
    } else {
        res.redirect("/")
    }
})

user_router.post('/logout', async (req, res) => {
    req.session.gotanorder = false
    req.session.isloggedin = false
    req.session.user = null
    req.session.editorder = null
    req.session.orderprice = null
    req.session.ordertype = null
    res.redirect("/")
})


user_router.post("/editprofile", async (req, res) => {
    req.session.gotanorder = false
    if (req.session.isloggedin) {
        res.render('updateuser')
        return
    }
    res.redirect("/")
})

user_router.post('/updateuser', async (req, res) => {
    req.session.gotanorder = false
    if (req.session.isloggedin) {
        if (req.body.password != req.body.confirmpassword) {
            res.render('updateusererror')
            return
        }
        const newobject = {}
        if (req.body.name) {
            newobject.name = req.body.name
            req.session.user.name = req.body.name
        }

        if (req.body.email && verify_email(req.body.email)) {
            newobject.email = req.body.email
            req.session.user.email = req.body.email
        }

        if (req.body.mobile_number && verify_mobile_number(req.body.mobile_number)) {
            newobject.mobile_number = req.body.mobile_number
            req.session.user.mobile_number = req.body.mobile_number
        }

        if (req.body.password) {
            newobject.password = req.body.password
            req.session.user.password = req.body.password
        }

        if (Object.keys(newobject).length != 0) {
            await UserModel.updateOne({ _id: req.session.user._id }, { $set: newobject })
        }
        res.redirect("/")
    } else {
        res.redirect("/")
    }
})

user_router.post("/deleteuser", async (req, res) => {
    if (req.session.isloggedin) {
        req.session.isloggedin = false
        await UserModel.deleteOne({ _id: req.session.user._id })
        await OrderModel.deleteMany({Customer: req.session.user._id})
        req.session.destroy()
    }
    res.redirect("/")
})

user_router.post('/savelocation', (req, res) => {
    req.session.gotanorder = false
    console.log(req.body)

    res.json({ redirectUrl: "/" })
})

module.exports = user_router