const OrderModel = require("../models/order");
const UserModel = require("../models/User");

async function cleardata() {
    await UserModel.remove({})
    await OrderModel.remove({})
}

async function deleteuser(email) {
    
}