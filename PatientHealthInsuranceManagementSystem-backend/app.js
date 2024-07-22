//switch 

const winston = require('winston');
require('express-async-errors');
var express = require('express'),
  app = express(),
  server = require("http").createServer(app),
  io = require("socket.io")(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
  }),
  path = require('path'),
  port = process.env.PORT || 3002,
  hostname = process.env.HOST || '127.0.0.1',
  bodyParser = require("body-parser"),
  cors = require('cors'),
  auth = require('./middleware/auth/role'),
  register = require('./routes/register'),
  login = require('./routes/login'),
  password = require('./routes/password'),
  patients = require('./routes/patients'),
  covidsurvey = require('./routes/covidsurvey'),
  doctorsearch = require('./routes/doctorsearch'),
  insurancesearch = require('./routes/insurancesearch'),
  bookappointment = require('./routes/bookappointment'),
  insurance = require('./routes/insurance'),
  doctors = require('./routes/doctors'),
  onConnect = require('./utils/socket'),
  error = require('./middleware/error');

// Winston Log Configuration
winston.configure({
  format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logfile.log" })
  ]
});
process.on('uncaughtException', (ex) => {
  // In the case of uncaught exceptions
  winston.error(`UNCAUGHT EXCEPTION: ${ex.message}`, ex);
});
process.on('unhandledRejection', (ex) => {
  // In the case of unhandled promise rejections
  winston.error(`UNHANDLED REJECTION: ${ex.message}`, ex);
});

app.use(cors());

app.use(bodyParser.json({ limit: '10mb' }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', express.static(path.join(__dirname, 'build')));

app.use('/api/register', register);
app.use('/api/login', login);
app.use('/api/password', password);
app.use('/api/patients', auth, patients);
app.use('/api/covidsurvey', auth, covidsurvey);
app.use('/api/doctorsearch', auth, doctorsearch);
app.use('/api/bookappointment', auth, bookappointment);
app.use('/api/insurancesearch', auth, insurancesearch);
app.use('/api/doctors', auth, doctors);
app.use('/api/insurance', auth, insurance);
app.use(error);

app.get(['/', '/*'], function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// app.use(function(req, res, next) {
//   let err = new Error("Not Found");
//   err.status = 404;
//   next(err);
// });

io.on('connection', socket => {
  onConnect(socket, io);
});

server.listen(port, () => {
  winston.info(`Server running at ${hostname}:${port}/`);
});