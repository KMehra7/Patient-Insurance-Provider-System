const { doQuery, sql } = require('../db');
const { ValidateCovidSurvey, } = require('../models/covidsurvey');
const bcrypt = require('bcryptjs');
const empty = require('is-empty');
const moment = require('moment');
const winston = require('winston');
const express = require('express');
const router = express.Router();

// Create or update patient covid survey
router.post('/', async function (req, res) {
    // Data Validation
    const { error } = ValidateCovidSurvey(req.body);
    if (error) return res.status(400).send({ error: error.message });

    let query = "SELECT * FROM patientCovidSurvey WHERE id = @id;";
    let params = [
        { name: 'id', sqltype: sql.Int, value: req.body.id }
    ];

    doQuery(res, query, params, function (selectData) {
        params = [
            { name: 'id', sqltype: sql.Int, value: req.body.id },
            { name: 'surveydate', sqltype: sql.Date, value: moment().format('YYYY-MM-DD') },
            { name: 'symptoms', sqltype: sql.Bit, value: req.body.symptoms === "YES" },
            { name: 'contactwithcovidperson', sqltype: sql.Bit, value: req.body.contactwithcovidperson === "YES" },
            { name: 'covidpositivetest', sqltype: sql.Bit, value: req.body.covidpositivetest === "YES" },
            { name: 'selfmonitor', sqltype: sql.Bit, value: req.body.selfmonitor === "YES" },
            { name: 'requesttest', sqltype: sql.Bit, value: req.body.requesttest === "YES" }
        ];

        // Create it
        if (empty(selectData.recordset)) {
            query = `INSERT INTO patientCovidSurvey (id, surveydate, symptoms, contactwithcovidperson, covidpositivetest, selfmonitor, requesttest)  
                OUTPUT INSERTED.* 
                VALUES (@id, @surveydate, @symptoms, @contactwithcovidperson, @covidpositivetest, @selfmonitor, @requesttest);`;
            doQuery(res, query, params, function (insertData) {
                if (empty(insertData.recordset)) return res.status(500).send({ error: "Data failed to save." });

                return res.status(200).send({ ...insertData.recordset[0] })
            });
        }
        // Update it
        else {
            query = `UPDATE patientCovidSurvey 
            SET surveydate = @surveydate, symptoms = @symptoms,
            contactwithcovidperson = @contactwithcovidperson, covidpositivetest = @covidpositivetest, selfmonitor = @selfmonitor, requesttest = @requesttest
            OUTPUT INSERTED.* 
            WHERE id = @id;`;
            doQuery(res, query, params, function (updateData) {
                if (empty(updateData.recordset)) return res.status(500).send({ error: "Data failed to update." });

                return res.status(200).send({ ...updateData.recordset[0] })
            });
        }
    });
});

module.exports = router;