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

module.exports = {orderpricecalculator}