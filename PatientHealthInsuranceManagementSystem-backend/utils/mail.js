const nodemailer = require('nodemailer');
const { GMAIL_PASSWORD } = require('./constants');
const winston = require('winston');


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'apollocareg5@gmail.com',
    pass: GMAIL_PASSWORD
  }
});

module.exports = async (to, subject, html) => {

  const mailOpts = {
    from: 'ApolloCare IT Team!', // This is ignored by Gmail
    to: to,
    subject: subject,
    html: html
  };

  try {
    // winston.info(transporter.auth.user);
    // winston.info(transporter.auth.pass);
    await transporter.verify();
    return new Promise(function (resolve, reject) {
      transporter.sendMail(mailOpts, (error, response) => {
        if (error) {
          return reject(error);  // Show a page indicating failure
        }
        else {
          return resolve(); // Show a page indicating success
        }
      });
    });
  } catch (ex) {
    winston.error(ex);
    return reject(ex)
  }
}