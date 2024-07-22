const Joi = require('joi');
const winston = require('winston');
const constants = require('../utils/constants');

function ValidateInsuranceDetails(request) {
    const schema = Joi.object({
        companyname: Joi.string().required(),
        address1: Joi.string().required(),
        address2: Joi.string().allow('', null),
        city: Joi.string().required().regex(constants.regexLettersOnly).error(() => new Error('City field is require and should contain only letters.')),
        state1: Joi.string().valid('AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY',
            'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR',
            'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY').required().error(() => new Error('State abbreviation is empty or invalid.')),
        zipcode: Joi.string().min(5).max(5).regex(constants.regexNumberOnly).required().error(() => new Error('Zipcode is required and must be 5 numbers.'))
    }).options({ stripUnknown: true });

    return constants.CleanErrorMessage(schema.validate(request));
}

function ValidateInsurancePlan(request) {
    const schema = Joi.object({
        iid: Joi.number().required(),
        planname: Joi.string().required(),
        policynumber: Joi.string(),
        premium: Joi.number().required(),
        deductible: Joi.number().required(),
        includesmedical: Joi.boolean().required(),
        includesdental: Joi.boolean().required(),
        includesvision: Joi.boolean().required()
    }).options({ stripUnknown: true });

    return constants.CleanErrorMessage(schema.validate(request));
}

module.exports.ValidateInsuranceDetails = ValidateInsuranceDetails;
module.exports.ValidateInsurancePlan = ValidateInsurancePlan;