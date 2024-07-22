const Joi = require('joi');
const moment = require('moment');
const winston = require('winston');
const constants = require('../utils/constants');

function ValidateBookAppointment(request) {
    const schema = Joi.object({
        did: Joi.required(),
        pid: Joi.required(),
        appointmentdate: Joi.date().min(moment().format('MM-DD-YYYY')).required(),
        starttime: Joi.number().min(540).max(990).required().error(() => new Error('Start time is missing or invalid.'))
    }).options({ stripUnknown: true });

    return constants.CleanErrorMessage(schema.validate(request));
}

function ValidateGetAppointments(request) {
    const schema = Joi.object({
        did: Joi.required(),
        startdate: Joi.date().required(),
    }).options({ stripUnknown: true });

    return constants.CleanErrorMessage(schema.validate(request));
}

module.exports.ValidateBookAppointment = ValidateBookAppointment;
module.exports.ValidateGetAppointments = ValidateGetAppointments;