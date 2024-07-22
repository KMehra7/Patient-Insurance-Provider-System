const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyBHNSnKacOj0Tcpfsr_-7HDx0HI3sSR5Io', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports = {
  geocoder
}

/*

EXAMPLE USAGE

geocoder.geocode({address: `${req.body.address} ${req.body.city} ${req.body.state} ${req.body.zip}`})
        .then(function(result) {

        })
        .catch(function(error) {
  
        })

*/