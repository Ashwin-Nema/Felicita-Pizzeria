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

//Checks that order placed if correct or not. If order placed is correct then the user is redirected to payment page else home page

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

// If user has not added anything to the cart and is trying to place order then order error is thrown

order_router.get("/ordererror", (req, res) => {
    if (req.session.ordererror) {
        res.render("ordererror")
        req.session.ordererror = null
        return
    }
    res.redirect("/")
})

// Displays map with user location and allows user to change its location

order_router.get('/selectlocation', async (req, res) => {
    req.session.gotanorder = false
    if (req.session.isloggedin) {
        let user = await UserModel.findById(req.session.user._id)
        async function rendermap() {
            res.render("locationordertype", { latitude: user.location[0], longtitude: user.location[1] })
        }
        await rendermap()
        return
    }
    res.redirect("/")
})


// Displays payment page where user has to make payment

order_router.get("/makepayment", (req, res) => {
    if (req.session.gotanorder && req.session.isloggedin) {
        res.render('payment', { amount: req.session.orderprice, name: req.session.user.name, mobile_number: req.session.user.mobile_number, email: req.session.user.email })
        return
    }
    req.session.gotanorder = false
    res.redirect("/")
})

// If the transaction is valid it is completed in this route, then the user is redirected to the home page

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
    if (flag) {
        async function redirecttomainroute() {
            res.redirect("/paymentsuccess")
        }
        await redirecttomainroute()
    } else {
        req.session.editorder = false
        req.session.error = { edit: true }
        res.redirect("/editordererror")
    }
})

// Configures Razor Pay gateway

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

// Displays error if user if user is trying to edit order after its time for editing it is over

order_router.get("/editordererror", (req, res) => {
    req.session.gotanorder = false
    if (req.session.error) {
        res.render('editdeleteerror', req.session.error)
        req.session.error = null
        return
    }
    res.redirect("/")
})

// Displays error if user if user is trying to delete order after its time for deleting it is over

order_router.get("/deleteordererror", (req, res) => {
    req.session.gotanorder = false
    if (req.session.error) {
        res.render('editdeleteerror', req.session.error)
        req.session.error = null
        return
    }
    res.redirect("/")
})

// Allows user to edit order if the time for editing it is not over,else redirects to error page

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

// Allows user to delete an order if the time for deleting it is not over

order_router.post("/deleteorder", async (req, res) => {
    req.session.gotanorder = false
    req.session.editorder = false
    if (checkinglastordertime(req.session.user, Date.now())) {
        let order = await getlastorderid(req.session.user)
        let user = await UserModel.findById(req.session.user._id)
        await OrderModel.deleteOne({ _id: order })
        await UserModel.updateOne({ _id: req.session.user._id }, { $pull: { orders: order } })
        res.redirect("/")
        return
    }
    req.session.error = { delete: true }
    res.redirect("/deleteordererror")
})

// Sets the type of order to home delivery if the user has logged in, then redirects to home page

order_router.post("/homedelivery", (req, res) => {
    req.session.gotanorder = false
    if (req.session.isloggedin) {
        req.session.ordertype = "Home delivery"
    }
    res.redirect("/")
})

// Sets the type of order to dine in if the user has logged in, then redirects to home page

order_router.post("/dinein", (req, res) => {
    req.session.gotanorder = false
    if (req.session.isloggedin) {
        req.session.ordertype = "Dine in"
    }
    res.redirect("/")
})

// Displays that payment has been successful

order_router.get("/paymentsuccess", (req, res) => {
    if (req.session.gotanorder) {
        res.render("treansctionsuccessful")
        req.session.gotanorder = false
        return
    }
    res.redirect("/")
})

// Cancels edit order option if user has selected it

order_router.post("/canceledit", (req, res) => {
    req.session.editorder = false
    res.redirect("/")
})

order_router.get("/orderhistory", async (req, res) => {
    if (req.session.isloggedin) {
        let allorders = await OrderModel.find({Customer: req.session.user._id})
        res.json(allorders)
        return
    }
    res.redirect("/")
})

module.exports = order_router