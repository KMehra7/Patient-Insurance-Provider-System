const { doQuery, sql } = require('../db');
const { ValidateInsuranceSearch } = require('../models/insurancesearch');
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

// GET Insurances' based on params
router.post('/', async function (req, res) {

    const companyname = req.body.companyname;
    const includesmedical = req.body.includesmedical;
    const includesdental = req.body.includesdental;
    const includesvision = req.body.includesvision;
    const params = [];

    let query = `SELECT insurancePlans.*, 
                insuranceDetails.companyname, insuranceDetails.address1, insuranceDetails.address2, insuranceDetails.city, insuranceDetails.state1, insuranceDetails.zipcode, insuranceDetails.lng, insuranceDetails.lat 
                FROM insurancePlans inner join insuranceDetails on insuranceDetails.id = insurancePlans.iid WHERE 
                ${empty(companyname) ? '' : `insuranceDetails.companyname LIKE '%${companyname}%' `}
                ${`${empty(companyname) ? '' : 'and '}(insurancePlans.includesmedical = ${includesmedical === "Yes" ? '1)' : '0 or insurancePlans.includesmedical = 1)'}`}
                ${`and (insurancePlans.includesdental = ${includesdental === "Yes" ? '1)' : '0 or insurancePlans.includesdental = 1)'}`}
                ${`and (insurancePlans.includesvision = ${includesvision === "Yes" ? '1)' : '0 or insurancePlans.includesvision = 1)'}`}
                ;`

    doQuery(res, query, [], function (selectData) {
        return res.status(200).send(selectData.recordset);
    });
});

// GET Insurances' based on params
router.get('/similar/:id', async function (req, res) {
    
    let query = `SELECT insurancePlans.*, 
                insuranceDetails.companyname, insuranceDetails.address1, insuranceDetails.address2, insuranceDetails.city, insuranceDetails.state1, insuranceDetails.zipcode, insuranceDetails.lng, insuranceDetails.lat 
                FROM insurancePlans inner join insuranceDetails on insuranceDetails.id = insurancePlans.iid WHERE iid = @id;`

    const params = [
        { name: 'id', sqltype: sql.Int, value: req.params.id }
    ];

    doQuery(res, query, params, function (selectData) {
        return res.status(200).send(selectData.recordset);
    });
});

module.exports = router;