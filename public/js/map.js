const map = L.map('map').setView([18.95225, 72.80453], 16);
let unreachable = document.getElementById("unreachable")
let userlongtitude  = null
let userlatitude = null
let flag = true
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const shopicon = L.icon({
    iconUrl: 'https://res.cloudinary.com/ash006/image/upload/v1622457972/shop_myswcw.jpg',
    iconSize: [30, 30],
})

const shop = L.marker([18.95225, 72.80453], { icon: shopicon })
const customer = L.marker([Number(document.getElementById("latitude").value) , Number(document.getElementById("longtitude").value)], { draggable: true })
customer.addTo(map).bindPopup('You are here').openPopup()

shop.addTo(map)


document.getElementById('mapbuttton').addEventListener('click', (event) => {
    if (!userlatitude || !userlongtitude || !flag) {
        event.preventDefault()
    }
    if (typeof userlatitude == "number" && typeof userlongtitude == "number" && getDistanceFromLatLonInKm(18.95225, 72.80453, userlatitude, userlongtitude) <=20 ) {
        axios.post('/savelocation', {
            latitude: userlatitude,
            longtitude: userlongtitude
          })
          .then(function (response) {
            console.log(response.data);
            window.location.replace(response.data.redirectUrl)
          })
          .catch(function (error) {
            console.log(error);
          });
    }
})

function locationofuser(event) {
    customer.bindPopup('You are here').openPopup()
    const latitude = customer.getLatLng().lat
    const longtide = customer.getLatLng().lng
    const distance = getDistanceFromLatLonInKm(18.95225, 72.80453, latitude, longtide)
    if (distance > 20) {
        unreachable.classList.remove('hidden')
        userlatitude = null
        userlongtitude = null
        flag = false
    }
    else {
        unreachable.classList.add('hidden')
        userlatitude = latitude
        userlongtitude = longtide
        flag = true
    }
}

function addpopup() {
    customer.bindPopup('You are here').openPopup()
}

customer.addEventListener('dragend', locationofuser)
customer.addEventListener('click', addpopup)

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}
