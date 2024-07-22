const Joi = require('joi');
const moment = require('moment');
const winston = require('winston');
const constants = require('../utils/constants');

function ValidateDoctorSearch(request) {
    const schema = Joi.object({
        treatscovid: Joi.string().required().allow("", null),
        namesearch: Joi.boolean().required()
    }).options({ stripUnknown: true });

    return constants.CleanErrorMessage(schema.validate(request));
}

module.exports.ValidateDoctorSearch = ValidateDoctorSearch;
