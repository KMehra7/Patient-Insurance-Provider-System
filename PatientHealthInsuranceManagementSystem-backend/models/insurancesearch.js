const Joi = require('joi');
const moment = require('moment');
const winston = require('winston');
const constants = require('../utils/constants');

function ValidateInsuranceSearch(request) {
    const schema = Joi.object({
        companyname: Joi.string().required().allow("", null),
        includesmedical: Joi.string().required().allow("", null),
        includesdental: Joi.string().required().allow("", null),
        includesvision: Joi.string().required().allow("", null),
    }).options({ stripUnknown: true });

    return constants.CleanErrorMessage(schema.validate(request));
}

module.exports.ValidateInsuranceSearch = ValidateInsuranceSearch;
