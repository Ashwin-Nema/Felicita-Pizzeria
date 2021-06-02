let peppypaneerpizza = document.getElementById("peppypaneerpizza")
let cheeseandcornpizza = document.getElementById("cheeseandcornpizza")
let chickensausagepizza = document.getElementById("chickensausagepizza")
let indiantandoorichickentikkapizza = document.getElementById("indiantandoorichickentikkapizza")


function limitorder(event) {
    if (event.target.value > 20) {
        event.target.value = 20
    }
    if (event.target.value < 0) {
        event.target.value = 0
    }
}

peppypaneerpizza.addEventListener('input', limitorder)
cheeseandcornpizza.addEventListener('input', limitorder)
chickensausagepizza.addEventListener('input', limitorder)
indiantandoorichickentikkapizza.addEventListener('input', limitorder)

document.getElementById("submitbutton").addEventListener('click', (event) => {
    let finalorder = {}
    if (peppypaneerpizza.value > 0) {
        finalorder.peppypaneerpizza = peppypaneerpizza.value
    }

    if (cheeseandcornpizza.value > 0) {
        finalorder.cheeseandcornpizza = cheeseandcornpizza.value
    }

    if (chickensausagepizza.value > 0) {
        finalorder.chickensausagepizza = chickensausagepizza.value
    }

    if (indiantandoorichickentikkapizza.value > 0) {
        finalorder.indiantandoorichickentikkapizza = indiantandoorichickentikkapizza.value
    }

    if (Object.keys(finalorder).length != 0) {
        axios.post('/placeorder',finalorder)
          .then(function (response) {
            console.log(response.data);
            window.location.replace(response.data.redirectUrl)
        
          })
          .catch(function (error) {
            console.log(error);
          });
    }
})