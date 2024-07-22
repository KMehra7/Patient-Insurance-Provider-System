const Joi = require('joi');
const winston = require('winston');
const constants = require('../utils/constants');

function ValidateDoctorDetails(request) {
    const schema = Joi.object({
        practicename: Joi.string().required(),
        address1: Joi.string().required(),
        address2: Joi.string().allow('', null),
        city: Joi.string().required().regex(constants.regexLettersOnly).error(() => new Error('City field is require and should contain only letters.')),
        state1: Joi.string().valid('AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY',
            'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR',
            'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY').required().error(() => new Error('State abbreviation is empty or invalid.')),
        zipcode: Joi.string().min(5).max(5).regex(constants.regexNumberOnly).required().error(() => new Error('Zipcode is required and must be 5 numbers.')),
        npinumber: Joi.string().custom(NPINumber, 'NPI Number Validator').required().error(() => new Error('NPI Number is empty or invalid. (Debug Message: Use 1234567893 as a acceptable value)')),
        specializations: Joi.required(),
        treatscovid: Joi.boolean().required(),
        bedstaken: Joi.number().min(0).max(Joi.ref('bedsmax')).allow(null),
        bedsmax: Joi.number().min(0).allow(null)

    }).options({ stripUnknown: true });

    return constants.CleanErrorMessage(schema.validate(request));
}

const NPINumber = (value, helpers) => {

    try {
        if (ValidateNPINumber(value))
            return value;
        else
            throw new Error('NPI Number is invalid. (Debug Message: Use 1234567893 as a acceptable value)');
    } catch (ex) {
        throw new Error('NPI Number is invalid. (Debug Message: Use 1234567893 as a acceptable value)');
    }
};

/**
 * https://stackoverflow.com/questions/9326448/is-there-any-algorithm-which-check-right-npi-national-provider-identification
 * https://www.cms.gov/Regulations-and-Guidance/HIPAA-Administrative-Simplification/NationalProvIdentStand/downloads/NPIcheckdigit.pdf
*/
function ValidateNPINumber(value) {
    let npi = value;
    npi = npi.split('');
    const checkBit = npi.pop();
    npi.reverse();
    let npiDouble = [];
    let npiUnaffected = [];

    for (let i = 0; i < npi.length; i++) {
        if ((i % 2) === 0) { npiDouble.push((npi[i] * 2)); }
        if ((i % 2) === 1) { npiUnaffected.push(npi[i]); }
    }

    npiDouble = npiDouble.toString().replace(/,/g, '');
    npiUnaffected = npiUnaffected.toString().replace(/,/g, '');

    let total = npiUnaffected + npiDouble
    let total_sum = 0;

    for (let i = 0; i < total.length; i++) {
        total_sum += parseInt(total.charAt(i));
    }

    total_sum += 24; //Magic Bit
    const final = Math.ceil((total_sum) / 10) * 10;
    return ((final - total_sum) == checkBit) ? true : false;
}

module.exports.ValidateDoctorDetails = ValidateDoctorDetails;