const UserModel = require("../models/User")

async function verify_mobile_number(number) {
    const regx = /^[7-9][0-9]{9}$/
    try {
        var user = await UserModel.findOne({mobile_number:number})
    } catch (error) {
        return false
    }
    if (!regx.test(number) || user) {
        console.log(typeof number)
        return false
    }
    return true
}

async function verify_email(email) {
    try {
        var user = await UserModel.findOne({email})
    } catch(error) {
        return false
    }
    
    const regx = /^([a-z0-9\.-]+)@([a-z0-9-]+).([a-z]{2,8})(.[a-z]{2,8})?$/
    if (!regx.test(email) || user) return false
    return true
}


module.exports = {verify_mobile_number, verify_email}