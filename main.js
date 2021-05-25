const express = require('express')
require('dotenv').config()
const app = express()
const expHbs = require('express-handlebars');
const mongoose = require('mongoose');
const { verify_mobile_number, verify_email } = require('./middlewares/verification');
const user_router = require('./routes/user');
app.use(express.json());
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.engine('hbs', expHbs({extname:'hbs'}))
app.set('view engine', 'hbs')
const {DATABASE} = process.env



mongoose.connect(DATABASE, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify:true,
    useCreateIndex:true
},async (err) => {
    if (err) throw err
    console.log('Connected')
})

app.use("", user_router)

verify_email("dfsdfdf")
app.listen(3000)