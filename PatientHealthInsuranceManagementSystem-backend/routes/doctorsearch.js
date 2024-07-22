const { doQuery, sql } = require('../db');
const { ValidateDoctorSearch } = require('../models/doctorsearch');
// const { ValidatePatientMedicalData } = require('../models/puser');
// const constants = require('../utils/constants');
// const mail = require('../utils/mail');
// const storage = require('../utils/storage');
// const bcrypt = require('bcryptjs');
const empty = require('is-empty');
// const moment = require('moment'),
const winston = require('winston');
const express = require('express');
const { geocoder } = require('../utils/geocoder');
const router = express.Router();

router.get('/:id', async function (req, res) {
    //validation needed - params.id

    let query = `SELECT *, 
                (SELECT * FROM doctorDetails WHERE doctorUsers.id = doctorDetails.id FOR JSON PATH) AS detail, 
                (SELECT doctorSpecializations.* FROM doctorSpecializations WHERE doctorUsers.id = doctorSpecializations.id FOR JSON PATH) AS specialization,
                (SELECT concat(patientUsers.fname, ' ', patientUsers.lname) as patientname, rating, reviewmessage FROM doctorReviews inner join patientUsers on patientUsers.id = doctorReviews.pid WHERE doctorReviews.did = doctorUsers.id FOR JSON PATH) AS reviews
                FROM doctorUsers WHERE id = ${req.params.id};`;
    let params = [];

    doQuery(res, query, params, function (selectData) {
        if (empty(selectData.recordset)) return res.status(400).send({ error: "Doctor record does not exist." });

        delete selectData.recordset[0].pword;

        return res.status(200).send({ ...selectData.recordset.map(item => { let s = empty(JSON.parse(item.specialization)) ? {} : JSON.parse(item.specialization)[0]; delete item.specialization; return ({ ...item, detail: empty(JSON.parse(item.detail)) ? {} : JSON.parse(item.detail)[0], specializations: s, reviews: empty(JSON.parse(item.reviews)) ? [] : JSON.parse(item.reviews) }) })[0] });
    });

});

// GET Doctor's based on params
router.post('/', async function (req, res) {
    // Data Validation
    const { error } = ValidateDoctorSearch(req.body);
    if (error) return res.status(400).send({ error: error.message });

    const covidOnly = req.body.treatscovid; // covidonly will be 'Yes', 'No', or ''
    const nameSearch = req.body.namesearch;
    const speciality = req.body.speciality;
    const address = req.body.address;
    const name = req.body.name;

    if (empty(address)) {
        let query = `SELECT doctorUsers.id, doctorUsers.fname, doctorUsers.lname, doctorUsers.email, doctorUsers.phonenumber, 
        (SELECT * FROM doctorDetails WHERE doctorUsers.id = doctorDetails.id FOR JSON PATH) AS detail,
        (SELECT doctorSpecializations.* FROM doctorSpecializations WHERE doctorUsers.id = doctorSpecializations.id FOR JSON PATH) AS specialization,
        (SELECT concat(patientUsers.fname, ' ', patientUsers.lname) as patientname, rating, reviewmessage FROM doctorReviews inner join patientUsers on patientUsers.id = doctorReviews.pid WHERE doctorReviews.did = doctorUsers.id FOR JSON PATH) AS reviews
        FROM doctorUsers 
        INNER JOIN doctorDetails on doctorDetails.id = doctorUsers.id 
        INNER JOIN doctorSpecializations on doctorUsers.id = doctorSpecializations.id
        ${nameSearch ? `WHERE (doctorUsers.fname LIKE '%${name}%' OR doctorUsers.lname LIKE '%${name}%' OR CONCAT(doctorUsers.fname, ' ', doctorUsers.lname) = '${name}') ` : ''}
        ${!nameSearch ? `WHERE (doctorSpecializations.${speciality} = 1) ` : ''}
        ${empty(covidOnly) ? '' : `and doctorDetails.treatscovid = ${covidOnly === "Yes" ? 1 : 0}`};`;

        doQuery(res, query, [], function (selectData) {
            res.send(selectData.recordset.map(item => { let s = empty(JSON.parse(item.specialization)) ? {} : JSON.parse(item.specialization)[0]; delete item.specialization; return ({ ...item, detail: empty(JSON.parse(item.detail)) ? {} : JSON.parse(item.detail)[0], specializations: s, reviews: empty(JSON.parse(item.reviews)) ? [] : JSON.parse(item.reviews) }) }));
        });

    } else {
        geocoder.geocode(`${address}`)
            .then(function (result) {
                if (empty(result)) return res.status(400).send({ error: "Location not found." });
                let query = `SELECT doctorUsers.id, doctorUsers.fname, doctorUsers.lname, doctorUsers.email, doctorUsers.phonenumber, dbo.CalculateDistance(${result[0].longitude}, ${result[0].latitude}, doctorDetails.lng, doctorDetails.lat) as distance,
                (SELECT * FROM doctorDetails WHERE doctorUsers.id = doctorDetails.id FOR JSON PATH) AS detail,
                (SELECT doctorSpecializations.* FROM doctorSpecializations WHERE doctorUsers.id = doctorSpecializations.id FOR JSON PATH) AS specialization,
                (SELECT concat(patientUsers.fname, ' ', patientUsers.lname) as patientname, rating, reviewmessage FROM doctorReviews inner join patientUsers on patientUsers.id = doctorReviews.pid WHERE doctorReviews.did = doctorUsers.id FOR JSON PATH) AS reviews
                FROM doctorUsers 
                INNER JOIN doctorDetails on doctorDetails.id = doctorUsers.id 
                INNER JOIN doctorSpecializations on doctorUsers.id = doctorSpecializations.id
                ${nameSearch ? `WHERE (doctorUsers.fname LIKE '%${name}%' OR doctorUsers.lname LIKE '%${name}%' OR CONCAT(doctorUsers.fname, ' ', doctorUsers.lname) = '${name}') ` : ''}
                ${!nameSearch ? `WHERE (doctorSpecializations.${speciality} = 1) ` : ''}
                and dbo.CalculateDistance(${result[0].longitude}, ${result[0].latitude}, doctorDetails.lng, doctorDetails.lat) < 50
                ${empty(covidOnly) ? '' : `and doctorDetails.treatscovid = ${covidOnly === "Yes" ? 1 : 0}`};`;

                doQuery(res, query, [], function (selectData) {
                    res.send(selectData.recordset.map(item => { let s = empty(JSON.parse(item.specialization)) ? {} : JSON.parse(item.specialization)[0]; delete item.specialization; return ({ ...item, detail: empty(JSON.parse(item.detail)) ? {} : JSON.parse(item.detail)[0], specializations: s, reviews: empty(JSON.parse(item.reviews)) ? [] : JSON.parse(item.reviews) }) }));
                });
            })
            .catch(function (error) {
                return res.status(400).send({ error: "Location not found." });
            });
    }
});

module.exports = router;