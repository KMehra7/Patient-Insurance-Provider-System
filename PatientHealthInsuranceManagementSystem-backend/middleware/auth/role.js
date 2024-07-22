const jwt = require('jsonwebtoken');
const role = require('./roleroutes');
const constants = require('../../utils/constants');

module.exports = function (req, res, next) {
	const token = req.header(constants.TOKEN_HEADER);
	if (!token) return res.status(401).send({error: 'Access Denied: No Token Provided!'});
	try {
		const decoded = jwt.verify(token.replace("Bearer ", ""), constants.JWT_SECRET);
		// think this should be decoded.userType?
		if(role[decoded.usertype].find(function(url) { return `/api/${url}` == req.baseUrl})) {
			next();
		} else
			return res.status(401).send({error: 'Access Denied: You dont have correct privilege to perform this operation'});
	}
	catch (ex) {
		return res.status(401).send({error: 'Access Denied: Invalid Token'});
	}
}