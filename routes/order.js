const express = require('express')
require('dotenv').config()
const { verify_email, verify_mobile_number } = require('../middlewares/verification')
const UserModel = require('../models/User')
const order_router = express.Router()
order_router.use(express.urlencoded({ extended: true }))
const session = require('express-session')
const ItemModel = require('../models/items')
const MongoDBStore = require('connect-mongodb-session')(session)
const { DATABASE, SESSIONSECRET, SESSION,RAZORPAYKEY,RAZORPAYPASSWORD } = process.env
const Razorpay = require('razorpay')
const razorpay = new Razorpay({
    key_id: RAZORPAYKEY,
    key_secret: RAZORPAYPASSWORD
})
const store = new MongoDBStore({
    uri:DATABASE,
    collection:SESSION
})

order_router.use(session({
    secret:SESSIONSECRET,
    resave:false,
    saveUninitialized:false,
    store:store
}))

order_router.post("/placeorder",async (req, res) =>{
    console.log(req.session.isloggedin == null)
    if (req.session.isloggedin) {
        try {
            const neworder = new ItemModel(req.body)
            const finalorder = await neworder.save()
            res.json(neworder._id == finalorder._id)
        } catch(error) {
            res.json({error:true})
        }
        return
    }
    res.send("hello")
    // res.redirect("/")
})

order_router.get('/selectlocation', (req, res) => {
    res.render("locationordertype")
})

order_router.get("/makepayment", (req, res) => {
    res.render('payment', {amount:500, name:"Ashwin"})
})

order_router.post('/complete', (req, res) => {
    razorpay.payments.fetch(req.body.razorpay_payment_id).then( (paymentDocument) => {
        console.log(paymentDocument)
        res.send(paymentDocument)
    })
})

order_router.post('/order', (req, res) => {
    var options = {
        amount: 50000,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
    };
    razorpay.orders.create(options, (err, order) => {
        // console.log(order)
        res.json(order)
    })
})

module.exports = order_router