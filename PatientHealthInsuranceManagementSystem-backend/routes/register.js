const { doQuery, sql } = require('../db');
const { GenerateAuthToken, ValidateRegistration } = require('../models/user')
const constants = require('../utils/constants')
const storage = require('../utils/storage');
const bcrypt = require('bcryptjs');
const empty = require('is-empty')
const winston = require('winston');
const express = require('express');
const router = express.Router();

// Register New User
router.post('/', async (req, res) => {
    // Validate information in request
    const { error } = ValidateRegistration(req.body);
    if (error) return res.status(400).send({ error: error.message });

    // Make sure email isn't already registered in proper database table!!
    let query = `SELECT * FROM ${constants.UserTypeToTableName(req.body.usertype)} WHERE email = @email;`;
    let params = [
        { name: 'email', sqltype: sql.VarChar(255), value: req.body.email }
    ];

    doQuery(res, query, params, async function (selectData) {
        let user = empty(selectData.recordset) ? [] : selectData.recordset[0];
        if (!empty(user)) return res.status(400).send({ error: `E-mail already registered.` });

        // Protect the password, salt and hash it!
        const salt = await bcrypt.genSalt(11);
        user.pword = await bcrypt.hash(req.body.pword, salt);

        // Save new user to correct database table!
        query = `INSERT INTO ${constants.UserTypeToTableName(req.body.usertype)} (email, pword, fname, lname, phonenumber)
        OUTPUT INSERTED.*
        VALUES (@email, @pword, @fname, @lname, @phonenumber);`
        params = [
            { name: 'email', sqltype: sql.VarChar(255), value: req.body.email },
            { name: 'pword', sqltype: sql.VarChar(1024), value: user.pword },
            { name: 'fname', sqltype: sql.VarChar(255), value: req.body.fname },
            { name: 'lname', sqltype: sql.VarChar(255), value: req.body.lname },
            { name: 'phonenumber', sqltype: sql.VarChar(50), value: req.body.phonenumber }
        ];

        doQuery(res, query, params, function (insertData) {
            user = empty(insertData.recordset) ? [] : insertData.recordset[0];
            if (empty(user)) return res.status(500).send("Failed to register user.");

            storage.UploadFile(`${req.body.usertype}${insertData.recordset[0].id}`, "profile", constants.DEFAULT_PROFILE);

            user = { "id": user['id'], "usertype": req.body.usertype, exp: 3600 };

            // Return authenication token and created user object
            const token = GenerateAuthToken(user);
            return res.status(200).send({ token: token, id: user.id, usertype: req.body.usertype });
        });
    });
});

module.exports = router;