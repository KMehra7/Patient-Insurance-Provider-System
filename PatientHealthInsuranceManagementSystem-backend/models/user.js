const Joi = require('joi');
const JoiPC = require('joi-password-complexity');
const { JWT_SECRET, regexLettersOnly, regexPhoneNumber, CleanErrorMessage } = require('../utils/constants');
const jwt = require('jsonwebtoken');
const winston = require('winston');

const passwordOptions = {
    min: 12,
    max: 255,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 0,
    requirementCount: 4
};

function GenerateAuthToken(user) {
    return jwt.sign({ id: user.id, usertype: user.usertype }, JWT_SECRET, { expiresIn: 7200 });
}

function DecodeAuthToken(token) {
    return jwt.decode(token);
}

function ValidateRegistration(request) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        pword: JoiPC(passwordOptions).required(),
        fname: Joi.string().min(2).max(255).required().regex(regexLettersOnly).error(() => new Error('Name fields are required, must be longer than 1 characters, and should only contain letters.')),
        lname: Joi.string().min(2).max(255).required().regex(regexLettersOnly).error(() => new Error('Name fields are required, must be longer than 1 characters, and should only contain letters.')),
        phonenumber: Joi.string().required().regex(regexPhoneNumber).error(() => new Error('Phone number is required, must be 10 digits, and should only contain numbers.')),
        usertype: Joi.string().valid('patient', 'doctor', 'insurance').required().error(() => new Error('UserType is invalid or empty.'))
    });

    return CleanErrorMessage(schema.validate(request))
}

function ValidateLogin(request) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        pword: Joi.string().required(),
        usertype: Joi.string().valid('patient', 'doctor', 'insurance').required().error(() => new Error('UserType is invalid or empty.'))
    });

    return CleanErrorMessage(schema.validate(request))
}

function ValidateEmail(request) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        usertype: Joi.string().valid('patient', 'doctor', 'insurance').required().error(() => new Error('UserType is invalid or empty.'))
    });

    return CleanErrorMessage(schema.validate(request))
}

function ValidateDuoCode(request) {
    const schema = Joi.object({
        hashedduocode: Joi.string().required(),
        duo: Joi.string().required(),
        email: Joi.string().min(5).max(255).required().email(),
        usertype: Joi.string().valid('patient', 'doctor', 'insurance').required().error(() => new Error('UserType is invalid or empty.'))
    });

    return CleanErrorMessage(schema.validate(request))
}

function ValidatePassword(request) {
    const schema = Joi.object({
        pword: JoiPC(passwordOptions).required(),
        pwordconfirmation: Joi.string().valid(Joi.ref('pword')).required().error(() => new Error('Passwords do not match.'))
    }).options({ stripUnknown: true });

    return CleanErrorMessage(schema.validate(request));
}

function ValidateUpdateUser(request) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        fname: Joi.string().min(2).max(255).required().regex(regexLettersOnly).error(() => new Error('Name fields are required, must be longer than 1 characters, and should only contain letters.')),
        lname: Joi.string().min(2).max(255).required().regex(regexLettersOnly).error(() => new Error('Name fields are required, must be longer than 1 characters, and should only contain letters.')),
        phonenumber: Joi.string().required().regex(regexPhoneNumber).error(() => new Error('Phone number is required, must be 10 digits, and should only contain numbers.'))
    }).options({ stripUnknown: true });

    return CleanErrorMessage(schema.validate(request));
}

module.exports.GenerateAuthToken = GenerateAuthToken;
module.exports.DecodeAuthToken = DecodeAuthToken;
module.exports.ValidateRegistration = ValidateRegistration;
module.exports.ValidateLogin = ValidateLogin;
module.exports.ValidateEmail = ValidateEmail;
module.exports.ValidateDuoCode = ValidateDuoCode;
module.exports.ValidatePassword = ValidatePassword;
module.exports.ValidateUpdateUser = ValidateUpdateUser;
