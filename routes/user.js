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


user_router.get('/', (req, res) => {
    console.log(req.session.user)
    if (req.session.isloggedin) {
        res.render('home', req.session.user)
        return
    }
    res.render('home')
})

user_router.get('/login', (req, res) => {
    if (req.session.isloggedin) {
        res.redirect("/")
        return
    }
    res.render('login')
})

user_router.get('/signup', (req, res) => {
    if (req.session.isloggedin) {
        res.redirect("/")
        return
    }
    res.render("signup")
})

user_router.post('/signup', async (req, res) => {
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
        const finaluser = newuser.save()
        req.session.isloggedin = true
        req.session.user = newuser
        res.redirect("/")
        return
    } catch(error) {
        console.log(error)
    }
    res.render("signuperror")
})


user_router.post('/login', async (req, res)=> {
    try {
        const user = await UserModel.findOne({email:req.body.email})
        const isMatching = await bcrypt.compare(req.body.password, user.password)
        if (user != null && isMatching) {
            req.session.isloggedin = true
            req.session.user = user
            res.redirect("/")
            return
        }
    } catch(error) {
        console.log(error)
    }
    res.render('loginerror')
})

user_router.post('/logout', (req, res) => {
    req.session.isloggedin = false
    res.redirect("/")
})

user_router.post("/checkout", (req, res) => {
    if (req.session.isloggedin) {
        return
    }
    res.redirect('/login')
})

module.exports = user_router