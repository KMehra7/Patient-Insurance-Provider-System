const checkTrue = data => {
 	for (var key in data) {
    if (!data[key]) {
      return false;
    }
	}
	return true;
};
export default checkTrue;