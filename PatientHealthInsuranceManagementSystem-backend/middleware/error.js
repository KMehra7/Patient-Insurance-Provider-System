const winston = require('winston');

module.exports = function(error, req, res, next) {
    //Log the exception
    winston.info('error caught in from middleware/error')
    winston.error(error.message, error);
    res.status(500).send('Internal server error. Try again later.');
}