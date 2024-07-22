const Joi = require('joi');
const moment = require('moment');
const winston = require('winston');
const constants = require('../utils/constants');

function ValidateCovidSurvey(request) {
    const schema = Joi.object({
        id: Joi.required(),
        symptoms: Joi.string().required(),
        // feverorchills: Joi.boolean().required(),
        // cough: Joi.boolean().required(),
        // shortnessofbreathe: Joi.boolean().required(),
        // fatigue: Joi.boolean().required(),
        // muscleaches: Joi.boolean().required(),
        // headache: Joi.boolean().required(),
        // lossofsmelltaste: Joi.boolean().required(),
        // sorethroat: Joi.boolean().required(),
        // congestion: Joi.boolean().required(),
        // nauseaorvomiting: Joi.boolean().required(),
        // diarrhea: Joi.boolean().required(),
        contactwithcovidperson: Joi.string().required(),
        covidpositivetest: Joi.string().required(),
        selfmonitor: Joi.string().required(),
        requesttest: Joi.string().required()
    }).options({ stripUnknown: true });

    return constants.CleanErrorMessage(schema.validate(request));
}

module.exports.ValidateCovidSurvey = ValidateCovidSurvey;