const express = require('express')
require('dotenv').config()
const UserModel = require('../models/User')
const order_router = express.Router()
order_router.use(express.urlencoded({ extended: true }))
const session = require('express-session')
const ItemModel = require('../models/items')
const MongoDBStore = require('connect-mongodb-session')(session)
const { DATABASE, SESSIONSECRET, SESSION, RAZORPAYKEY, RAZORPAYPASSWORD } = process.env
const Razorpay = require('razorpay')
const { orderpricecalculator, checkinglastordertime, getlastorderid } = require('../middlewares/miscellaneous')
const OrderModel = require('../models/order')
const razorpay = new Razorpay({
    key_id: RAZORPAYKEY,
    key_secret: RAZORPAYPASSWORD
})
const store = new MongoDBStore({
    uri: DATABASE,
    collection: SESSION
})

order_router.use(session({
    secret: SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
    store: store
}))

order_router.post("/placeorder", async (req, res) => {
    req.session.gotanorder = false

    if (req.session.isloggedin) {
        try {
            const neworder = new ItemModel(req.body)
            const finalorder = await neworder.save()
            req.session.order = req.body
            req.session.gotanorder = true
            await ItemModel.deleteOne({ _id: finalorder._id })

            req.session.orderprice = orderpricecalculator(req.body)
            if (req.session.orderprice != 0) {
                res.json({ redirectUrl: "/makepayment" })
                return
            }
            req.session.ordererror = true
            res.json({ redirectUrl: "/ordererror" })
        } catch (error) {
            res.json({ redirectUrl: "/" })
        }
        return
    }
    res.redirect("/")
})

order_router.get("/ordererror", (req, res) => {
    if (req.session.ordererror) {
        res.render("ordererror")
        req.session.ordererror = null
        return
    }
    res.redirect("/")
})

order_router.get('/selectlocation',async (req, res) => {
    req.session.gotanorder = false
    if (req.session.isloggedin) {
        let user = await UserModel.findById(req.session.user._id)
        async function rendermap() {
            res.render("locationordertype", {latitude:user.location[0], longtitude: user.location[1]})
        }
        await rendermap()
        return
    }
    res.redirect("/")
})

order_router.get("/makepayment", (req, res) => {
    if (req.session.gotanorder && req.session.isloggedin) {
        res.render('payment', { amount: req.session.orderprice, name: req.session.user.name, mobile_number: req.session.user.mobile_number, email: req.session.user.email })
        return
    }
    req.session.gotanorder = false
    res.redirect("/")
})

order_router.post('/complete', async (req, res) => {
    let flag = true
   
    if (req.session.gotanorder && req.session.isloggedin) {
        razorpay.payments.fetch(req.body.razorpay_payment_id).then(async (paymentDocument) => {
            if (req.session.editorder) {
                if (checkinglastordertime(req.session.user, Date.now())) {
                    let changes = { items: req.session.order, price: req.session.orderprice }
                    if (req.session.ordertype) changes.ordertype = req.session.ordertype
                    let order = await getlastorderid(req.session.user)
                    await OrderModel.updateOne({ _id: order }, changes)
                } 
                else {
                    flag = false
                }
            }
            else {
                const customer = await UserModel.findById(req.session.user._id)
                const order = { items: req.session.order, price: req.session.orderprice }
                if (req.session.ordertype) order.ordertype = req.session.ordertype
                const finalorder = await OrderModel.create(order)
                finalorder.Customer = customer
                await finalorder.save()
                customer.orders.push(finalorder)
                await customer.save()
            }
        })
    }
    req.session.gotanorder = false
    if (flag) {
        async function redirecttomainroute() {
            res.redirect("/")
        }
        await redirecttomainroute()
    } else {
        req.session.editorder = false
        req.session.error = { edit: true }
        res.redirect("/editordererror")
    }
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

order_router.get("/editordererror", (req, res) => {
    req.session.gotanorder = false
    if (req.session.error) {
        res.render('editdeleteerror', req.session.error)
        req.session.error = null
        return
    }
    res.redirect("/")
})

order_router.get("/deleteordererror", (req, res) => {
    req.session.gotanorder = false
    if (req.session.error) {
        res.render('editdeleteerror', req.session.error)
        req.session.error = null
        return
    }
    res.redirect("/")
})

order_router.post("/editorder", (req, res) => {
    req.session.gotanorder = false
    if (checkinglastordertime(req.session.user, Date.now())) {
        req.session.editorder = true
        res.redirect('/')
        return
    }
    req.session.error = { edit: true }
    res.redirect("/editordererror")
})

order_router.post("/deleteorder", async (req, res) => {
    req.session.gotanorder = false
    if (checkinglastordertime(req.session.user, Date.now())) {
        let order = await getlastorderid(req.session.user)
        let user = await UserModel.findById(req.session.user._id)
        await OrderModel.deleteOne({ _id: order })
        await UserModel.updateOne({_id:req.session.user._id}, {$pull: {orders:order}})
        res.redirect("/")
        return
    }
    req.session.error = { delete: true }
    res.redirect("/deleteordererror")
})

order_router.post("/homedelivery", (req,res) => {
    req.session.gotanorder = false
    if (req.session.isloggedin) {
        req.session.ordertype = "Home delivery"
    }
    res.redirect("/")
})

order_router.post("/dinein", (req, res) => {
    req.session.gotanorder = false
    if (req.session.isloggedin) {
        req.session.ordertype = "Dine in"
    }
    res.redirect("/")
})

module.exports = order_router