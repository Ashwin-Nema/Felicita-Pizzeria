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


function verifydistance(lat1, lon1) {
    if (typeof lat1 != "number" || typeof lon1 != "number") {
        return false
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(18.95225 - lat1);  // deg2rad below
    var dLon = deg2rad(72.80453 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(18.95225)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    if (d <= 20) {
        return true
    }
    return false
}


module.exports = {verify_mobile_number, verify_email, verifydistance}