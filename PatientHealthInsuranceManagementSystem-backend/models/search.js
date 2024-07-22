const Joi = require('joi');
const winston = require('winston');
const constants = require('../utils/constants');

function ValidateDoctorSearch(request) {
    const schema = Joi.object({
        treatscovid: Joi.boolean.required(),
        namesearch: Joi.boolean.required(),
        name: Joi.string().allow('', null),
        address: Joi.string().allow('', null)
    }).options({ stripUnknown: true });

    return constants.CleanErrorMessage(schema.validate(request));
}

module.exports.ValidateDoctorSearch = ValidateDoctorSearch;