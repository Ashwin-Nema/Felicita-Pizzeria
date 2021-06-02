let finalamount = String(Number(document.getElementById("paymentamount").value) *100  )
let name = document.getElementById("name")

let enail = document.getElementById("email")

let mobile = document.getElementById("mobile")

axios.post('/order').then((info) => {
    console.log(info)

    var options = {
        "key": "rzp_test_lYaL0slH0VoZzj", // Enter the Key ID generated from the Dashboard
        "amount": finalamount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Felicita pizzeria",
        "image": "https://res.cloudinary.com/ash006/image/upload/v1621788264/Felicita_Pizzeria_1_cunl47.png",
        "theme": {
            "color": "#3399cc"
        },
        "callback_url": "/complete",
        "prefill": {
            "name": name.value,
            "email": email.value,
            "contact":mobile.value
        }
    };
    var rzp1 = new Razorpay(options);
    document.getElementById('rzp-button1').onclick = function (e) {
        rzp1.open();
        e.preventDefault();
    }
})