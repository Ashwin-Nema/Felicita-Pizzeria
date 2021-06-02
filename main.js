const express = require('express')
require('dotenv').config()
const app = express()
const expHbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const user_router = require('./routes/user');
const { cleardata } = require('./middlewares/seed');
const UserModel = require('./models/User');
const order_router = require('./routes/order');
const OrderModel = require('./models/order');
app.use(express.json());
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.engine('hbs', expHbs({ extname: 'hbs' , defaultLayout:false}))
app.set('view engine', 'hbs')
const { DATABASE, SESSIONSECRET, SESSION } = process.env

const store = new MongoDBStore({
    uri:DATABASE,
    collection:SESSION
})

app.use(session({
    secret:SESSIONSECRET,
    resave:false,
    saveUninitialized:false,
    store:store
}))

mongoose.connect(DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true
}, async (err) => {
    if (err) throw err
    console.log('Connected')
})

app.use("", user_router)
app.use("", order_router)
app.listen(process.env.PORT || 3000)