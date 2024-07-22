const getTotal = products => {
	let sum = 0;
	products.forEach(function(item) {
		sum += parseInt(item.quantity) * parseFloat(item.price)
	});
	return sum;
}
export default getTotal;