const OrderModel = require('../models/order')
const UserModel = require('../models/User')
function orderpricecalculator(order) {
    let total = 0
    if (order.peppypaneerpizza) {
        total += (Number(order.peppypaneerpizza) *395)
    }
    if (order.cheeseandcornpizza) {
        total += (Number(order.cheeseandcornpizza)*305)
    }
    if (order.chickensausagepizza) {
        total += (Number(order.chickensausagepizza)*305 )
    }

    if (order.indiantandoorichickentikkapizza) {
        total += (Number(order.indiantandoorichickentikkapizza) *570)
    }
    return total
}

async function checkinglastordertime(user, time) {
    time = time/1000
    let flag = false
    if (user != null) {
        let userdata = await UserModel.findOne({_id:user._id})
        if (userdata.orders.length > 0) {
            let order = await OrderModel.findOne({_id: userdata.orders[userdata.orders.length - 1]})
            let ordertime = order.createdAT.getTime()/1000
            if (time - ordertime <= 120) {
                flag = true
            }
        }
    }
    return flag
}

async function getlastorderid(user) {
    let userdata = await UserModel.findOne({_id:user._id})
    return userdata.orders[userdata.orders.length - 1]
}

module.exports = {orderpricecalculator, checkinglastordertime, getlastorderid}