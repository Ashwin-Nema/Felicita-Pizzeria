const express = require('express')
require('dotenv').config()
const UserModel = require('../models/User')
const order_router = express.Router()
order_router.use(express.urlencoded({ extended: true }))
const session = require('express-session')
const ItemModel = require('../models/items')
const MongoDBStore = require('connect-mongodb-session')(session)
const { DATABASE, SESSIONSECRET, SESSION,RAZORPAYKEY,RAZORPAYPASSWORD } = process.env
const Razorpay = require('razorpay')
const { orderpricecalculator } = require('../middlewares/miscellaneous')
const OrderModel = require('../models/order')
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
    req.session.gotanorder = false

    if (req.session.isloggedin) {
        try {
            const neworder = new ItemModel(req.body)
            const finalorder = await neworder.save()
            req.session.order = req.body
            req.session.gotanorder = true
            await ItemModel.deleteOne({ _id: finalorder._id})
            req.session.orderprice = orderpricecalculator(req.body)
            res.json({ redirectUrl: "/makepayment"})
        } catch(error) {
            res.json({ redirectUrl: "/" })
        }
        return
    }
    res.redirect("/")
})

order_router.get('/selectlocation', (req, res) => {
    req.session.gotanorder = false
    if (req.session.isloggedin) {
        res.render("locationordertype")
        return
    }
    res.redirect("/")
})

order_router.get("/makepayment", (req, res) => {
    if (req.session.gotanorder && req.session.isloggedin) {
        res.render('payment', {amount:req.session.orderprice,name:req.session.user.name,mobile_number:req.session.user.mobile_number,email:req.session.user.email })
        return
    }
    req.session.gotanorder = false
    res.redirect("/")
})

order_router.post('/complete',async (req, res) => {
    if (req.session.gotanorder && req.session.isloggedin) {
        razorpay.payments.fetch(req.body.razorpay_payment_id).then(async (paymentDocument) => {
            const customer = await UserModel.findById(req.session.user._id)
            const order = {items:req.session.order, price:req.session.orderprice}
            if (req.session.ordertype) order.ordertype = req.session.ordertype
            const finalorder = await OrderModel.create(order)
            finalorder.Customer = customer
            await finalorder.save()
            customer.orders.push(finalorder)
            await customer.save()
            flag = true
        })
    }
    req.session.gotanorder = false
    res.redirect("/")
})

order_router.post('/order', (req, res) => {
    if (req.session.isloggedin && req.session.gotanorder) {
        var options = {
            amount: 50000,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11"
        };
        razorpay.orders.create(options, (err, order) => {
            res.json(order)
        })
    
        return
    }
    else {
        res.redirect("/")
    }
})

module.exports = order_router