const { doQuery, doQueryNoRes, sql } = require('../db');
const { DecodeAuthToken, ValidatePassword, ValidateUpdateUser } = require('../models/user');
const { ValidateInsuranceDetails, ValidateInsurancePlan } = require('../models/iuser');
const constants = require('../utils/constants');
const { geocoder } = require('../utils/geocoder');
const storage = require('../utils/storage');
const bcrypt = require('bcryptjs');
const empty = require('is-empty');
const winston = require('winston');
const express = require('express');
const mail = require('../utils/mail');
const router = express.Router();


// GET insuranceUsers and insuranceDetails
router.get('/:id', async function (req, res) {
  let query = `SELECT *, (SELECT * FROM insuranceDetails WHERE insuranceUsers.id = insuranceDetails.id FOR JSON PATH) AS detail FROM insuranceUsers WHERE id = ${req.params.id};`;
  let params = [];

  doQuery(res, query, params, function (selectData) {
    if (empty(selectData.recordset)) return res.status(400).send({ error: "Insurance record does not exist." })

    delete selectData.recordset[0].pword;
    delete selectData.recordset[0].goauth;

    return res.status(200).send({ ...selectData.recordset.map(item => ({ ...item, detail: empty(JSON.parse(item.detail)) ? {} : JSON.parse(item.detail)[0] }))[0], usertype: 'insurance' });
  });
});

//#region PUT insuranceUsers/password/profilepic 

router.put('/user', async function (req, res) {
  // Data Validation
  const { error } = ValidateUpdateUser(req.body);
  if (error) return res.status(400).send({ error: error.message });

  // Make sure email isn't already registered in proper database table!!
  let query = `SELECT * FROM insuranceUsers WHERE email = @email and id <> @id;`;
  let params = [
    { name: 'email', sqltype: sql.VarChar(255), value: req.body.email },
    { name: 'id', sqltype: sql.Int, value: req.body.id }
  ];

  doQuery(res, query, params, async function (selectData) {
    let user = empty(selectData.recordset) ? [] : selectData.recordset[0];
    if (!empty(user)) return res.status(400).send({ error: `E-mail already registered.` });

    let query = `UPDATE insuranceUsers 
    SET email = @email, fname = @fname, lname = @lname, phonenumber = @phonenumber
    OUTPUT INSERTED.* 
    WHERE id = @id;`;
    let params = [
      { name: 'id', sqltype: sql.Int, value: req.body.id },
      { name: 'email', sqltype: sql.VarChar(255), value: req.body.email },
      { name: 'fname', sqltype: sql.VarChar(255), value: req.body.fname },
      { name: 'lname', sqltype: sql.VarChar(255), value: req.body.lname },
      { name: 'phonenumber', sqltype: sql.VarChar(50), value: req.body.phonenumber }
    ];

    doQuery(res, query, params, function (updateData) {
      if (empty(updateData.recordset)) return res.status(400).send({ error: "Data not saved." })

      delete updateData.recordset[0].pword

      return res.status(200).send(updateData.recordset[0]);
    });
  });
});

router.put('/password', async function (req, res) {
  // Data Validation
  const { error } = ValidatePassword(req.body);
  if (error) return res.status(400).send({ error: error.message });

  let query = `SELECT * FROM insuranceUsers WHERE id = ${req.body.id};`;
  let params = [];
  doQuery(res, query, params, async function (selectData) {
    if (empty(selectData.recordset)) return res.status(400).send({ error: "Insurance record does not exist." })
    const user = selectData.recordset[0];

    // Check password is correct
    bcrypt.compare(req.body.pwordold, user.pword)
      .then(async (isMatch) => {
        if (!isMatch) return res.status(400).send({ error: `Incorrect old password.` });
      })
      .catch((error) => {
        winston.error("Password compare failure: " + error);
        return res.status(400).send({ error: `Incorrect old password.` });
      });

    // salt and hash new pword
    const salt = await bcrypt.genSalt(11);
    hashedPassword = await bcrypt.hash(req.body.pword, salt);

    // set new pword for user.id in dbs
    query = `UPDATE insuranceUsers 
    SET pword = @pword
    OUTPUT INSERTED.* 
    WHERE id = @id;`;
    params = [
      { name: 'id', sqltype: sql.Int, value: req.body.id },
      { name: 'pword', sqltype: sql.VarChar(255), value: hashedPassword }
    ];

    doQuery(res, query, params, async function (updateData) {
      if (empty(updateData.recordset)) return res.status(400).send({ error: "Data not saved." })

      delete updateData.recordset[0].pword

      return res.status(200).send({ user: updateData.recordset[0] });
    });
  });
});

router.put('/profilepic', async function (req, res) {
  // This method is in storage b/c
  // patients, doctors, and insurance users
  // can all do this.
  // Don't write it 3 times,
  // Extract it to a single location.
  return storage.UpdateProfilePic(req, res);
});

//#endregion

//#region POST/PUT insuranceDetails

// Creates insuranceDetails record for insuranceUser
router.post('/onboard', async function (req, res) {
  // Data Validation
  const { error } = ValidateInsuranceDetails(req.body);
  if (error) return res.status(400).send({ error: error.message });

  let lat = null;
  let lng = null;
  await geocoder.geocode(`${req.body.address1} ${req.body.city} ${req.body.state1} ${req.body.zip}`)
    .then(function (result) {
      lat = result[0].latitude;
      lng = result[0].longitude
    })
    .catch(function (error) {
      winston.error(`Failed to find location for ${req.body.address1} ${req.body.city} ${req.body.state1} ${req.body.zip}. Error: ${error}`)
      return res.status(400).send({ error: "Address is invalid." });
    });

  let query = `INSERT INTO insuranceDetails (id, companyname, address1, address2, state1, city, zipcode, lat, lng)  
               OUTPUT INSERTED.* 
               VALUES (@id, @companyname, @address1, @address2, @state1, @city, @zipcode, @lat, @lng);`;
  let params = [
    { name: 'id', sqltype: sql.Int, value: req.body.id },
    { name: 'companyname', sqltype: sql.VarChar(255), value: req.body.companyname },
    { name: 'address1', sqltype: sql.VarChar(255), value: req.body.address1 },
    { name: 'address2', sqltype: sql.VarChar(255), value: req.body.address2 },
    { name: 'state1', sqltype: sql.VarChar(15), value: req.body.state1 },
    { name: 'city', sqltype: sql.VarChar(50), value: req.body.city },
    { name: 'zipcode', sqltype: sql.VarChar(15), value: req.body.zipcode },
    { name: 'lat', sqltype: sql.Float, value: lat },
    { name: 'lng', sqltype: sql.Float, value: lng }
  ];

  doQuery(res, query, params, function (insertData) {
    if (empty(insertData.recordset)) return res.status(500).send({ error: "Data not saved." })

    return res.status(200).send({ detail: insertData.recordset[0] });
  });
});

// Updates insuranceDetails record for insuranceUser
router.put('/details', async function (req, res) {
  // Data Validation
  const { error } = ValidateInsuranceDetails(req.body);
  if (error) return res.status(400).send({ error: error.message });

  let lat = null;
  let lng = null;
  await geocoder.geocode(`${req.body.address1} ${req.body.city} ${req.body.state1} ${req.body.zip}`)
    .then(function (result) {
      lat = result[0].latitude;
      lng = result[0].longitude
    })
    .catch(function (error) {
      winston.error(`Failed to find location for ${req.body.address1} ${req.body.city} ${req.body.state1} ${req.body.zip}. Error: ${error}`)
      return res.status(400).send({ error: "Address is invalid." });
    });

  let query = `UPDATE insuranceDetails 
    SET companyname = @companyname, address1 = @address1, address2 = @address2, state1 = @state1, city = @city, zipcode = @zipcode, lat = @lat, lng = @lng
               OUTPUT INSERTED.* WHERE id = @id;`;
  let params = [
    { name: 'id', sqltype: sql.Int, value: req.body.id },
    { name: 'companyname', sqltype: sql.VarChar(255), value: req.body.companyname },
    { name: 'address1', sqltype: sql.VarChar(255), value: req.body.address1 },
    { name: 'address2', sqltype: sql.VarChar(255), value: req.body.address2 },
    { name: 'state1', sqltype: sql.VarChar(15), value: req.body.state1 },
    { name: 'city', sqltype: sql.VarChar(50), value: req.body.city },
    { name: 'zipcode', sqltype: sql.VarChar(15), value: req.body.zipcode },
    { name: 'lat', sqltype: sql.Float, value: lat },
    { name: 'lng', sqltype: sql.Float, value: lng }
  ];

  doQuery(res, query, params, function (updateData) {
    if (empty(updateData.recordset)) return res.status(500).send({ error: "Data not saved." })

    return res.status(200).send({ detail: updateData.recordset[0] });
  });
});

//#endregion

//#region GET/POST/PUT insurancePlans

// Get all insurance plans
router.get('/plans/:id', async function (req, res) {
  let query = `SELECT insurancePlans.*, 
              (select count(*) from patientInsurancePlans where planid = insurancePlans.id) as patientcount 
              FROM insurancePlans WHERE iid = @id order by patientcount asc;`;
  let params = [
    { name: 'id', sqltype: sql.Int, value: req.params.id }
  ];
  doQuery(res, query, params, function (selectData) {
    if (empty(selectData.recordset)) return res.status(400).send({ error: "Insurance records do not exist." })

    return res.status(200).send(selectData.recordset);
  });
});

// Create a single insurance plan
router.post('/plan', async function (req, res) {
  // Data Validation
  const { error } = ValidateInsurancePlan(req.body);
  if (error) return res.status(400).send({ error: error.message });
  if (req.body.includesmedical === false && req.body.includesdental === false && req.body.includesvision === false)
    return res.status(400).send({ error: "Insurance plan must cover at least one medical area(medical, dental, vision)." });

  let query = `INSERT INTO insurancePlans (iid, planname, policynumber, premium, deductible, includesmedical, includesdental, includesvision) 
               OUTPUT INSERTED.* 
               VALUES (@iid, @planname, @policynumber, @premium, @deductible, @includesmedical, @includesdental, @includesvision);`;
  let params = [
    { name: 'iid', sqltype: sql.Int, value: req.body.iid },
    { name: 'planname', sqltype: sql.VarChar(255), value: req.body.planname },
    { name: 'policynumber', sqltype: sql.VarChar(255), value: req.body.policynumber },
    { name: 'premium', sqltype: sql.Float, value: req.body.premium },
    { name: 'deductible', sqltype: sql.Float, value: req.body.deductible },
    { name: 'includesmedical', sqltype: sql.Bit, value: req.body.includesmedical },
    { name: 'includesdental', sqltype: sql.Bit, value: req.body.includesdental },
    { name: 'includesvision', sqltype: sql.Bit, value: req.body.includesvision }
  ];

  doQuery(res, query, params, function (insertData) {
    if (empty(insertData.recordset)) return res.status(500).send({ error: "Data not saved." });

    res.status(200).send(insertData.recordset[0]);

    EmailCreateToSubscribers(req.body.iid, insertData.recordset[0]);
  });
});

// Update a single insurance plan
router.put('/plan/:id', async function (req, res) {
  // Data Validation
  const { error } = ValidateInsurancePlan(req.body);
  if (error) return res.status(400).send({ error: error.message });
  if (req.body.includesmedical === false && req.body.includesdental === false && req.body.includesvision === false)
    return res.status(400).send({ error: "Insurance plan must cover at least one medical area(medical, dental, vision)." });

  let query = `UPDATE insurancePlans 
    SET planname = @planname, policynumber = @policynumber, premium = @premium, deductible = @deductible, includesmedical = @includesmedical, includesdental = @includesdental, includesvision = @includesvision
    OUTPUT INSERTED.* WHERE id = @id;`;
  let params = [
    { name: 'id', sqltype: sql.Int, value: req.params.id },
    { name: 'planname', sqltype: sql.VarChar(255), value: req.body.planname },
    { name: 'policynumber', sqltype: sql.VarChar(255), value: req.body.policynumber },
    { name: 'premium', sqltype: sql.Float, value: req.body.premium },
    { name: 'deductible', sqltype: sql.Float, value: req.body.deductible },
    { name: 'includesmedical', sqltype: sql.Bit, value: req.body.includesmedical },
    { name: 'includesdental', sqltype: sql.Bit, value: req.body.includesdental },
    { name: 'includesvision', sqltype: sql.Bit, value: req.body.includesvision }
  ];

  doQuery(res, query, params, function (updateData) {
    if (empty(updateData.recordset)) return res.status(500).send({ error: "Data not saved." })

    EmailUpdateToSubscribers(req.body.id, updateData.recordset[0])

    return res.status(200).send(updateData.recordset[0]);
  });
});

// Update a insurance plan's explaination of benefits pdf
router.put('/insuranceplan/:planid/benefitspdf', async function (req, res) {
  // Data Validation
  if (empty(req.body.pdf)) return res.status(400).send({ error: "PDF data is required." });

  let token = DecodeAuthToken(req.header(constants.TOKEN_HEADER));
  container = token.usertype + token.id;

  storage.UploadFile(container, req.params.planid, req.body.pdf)
    .then((message) => {
      EmailPDFUpdateToSubscribers(token.id, req.params.planid)
      return res.status(200).send({ result: message.result, response: message.response });
    }).catch((error) => {
      return res.status(500).send({ error: error.message });
    });
});

//#endregion

//#region Email Subscriber Methods

async function EmailCreateToSubscribers(id, planData) {
  let query = `SELECT * FROM insuranceDetails WHERE insuranceDetails.id = ${id};`;

  doQueryNoRes(query, [], function (selectData) {
    if (empty(selectData.recordset)) winston.error(`Insurance details do not exist for insurance user ${id}. Cannot send insurance plan creation email.`);

    const companyName = selectData.recordset[0].companyname;

    query = `SELECT * FROM insurancePatientSubscription WHERE insurancePatientSubscription.iid = ${id};`;
    doQueryNoRes(query, [], function (selectData) {
      if (empty(selectData.recordset)) {
        winston.error(`No subscribers to this insurance. Not sending emails.`);
        return
      }

      const emails = []
      for (i = 0; i < selectData.recordset.length; i++) {
        emails.push(selectData.recordset[i].patientemail);
      }

      mail(emails, `${companyName} added a new insurance plan!`, insurancePlanCreated
        .replace("_INSURANCE_NAME_", companyName).replace("_INSURANCE_NAME_", companyName).replace("_INSURANCE_PREMIUM_", planData.premium)
        .replace("_INSURANCE_DEDUCTIBLE_", planData.deductible).replace("_INSURANCE_PLAN_", planData.planname))
        .then(() => {
        }).catch((error) => {
          winston.error(`Failed to send email to ${patientEmail}.`);
        });

    });
  });
}

async function EmailUpdateToSubscribers(id, planData) {
  let query = `SELECT * FROM insuranceDetails WHERE insuranceDetails.id = ${id};`;

  doQueryNoRes(query, [], function (selectData) {
    if (empty(selectData.recordset)) winston.error(`Insurance details do not exist for insurance user ${id}. Cannot send insurance plan creation email.`);

    const companyName = selectData.recordset[0].companyname;

    query = `SELECT * FROM insurancePatientSubscription WHERE insurancePatientSubscription.iid = ${id};`;
    doQueryNoRes(query, [], function (selectData) {
      if (empty(selectData.recordset)) {
        winston.error(`No subscribers to this insurance. Not sending emails.`);
        return
      }

      const emails = []
      for (i = 0; i < selectData.recordset.length; i++) {
        emails.push(selectData.recordset[i].patientemail);
      }

      mail(emails, `${companyName} updated an insurance plan!`, insurancePlanUpdate
        .replace("_INSURANCE_NAME_", companyName).replace("_INSURANCE_NAME_", companyName).replace("_INSURANCE_PREMIUM_", planData.premium)
        .replace("_INSURANCE_DEDUCTIBLE_", planData.deductible).replace("_INSURANCE_PLAN_", planData.planname))
        .then(() => {
        }).catch((error) => {
          winston.error(`Failed to send email to ${patientEmail}.`);
        });

    });
  });
}

async function EmailPDFUpdateToSubscribers(iid, planid) {
  let query = `SELECT * FROM insurancePlans WHERE id = @id and planid = @planid;`;
  let params = [
    { name: 'id', sqltype: sql.Int, value: iid },
    { name: 'planid', sqltype: sql.Int, value: planid }
  ];
  doQueryNoRes(query, params, function (selectData) {
    if (empty(selectData.recordset)) return res.status(400).send({ error: "Insurance plan record does not exist." })
    const planData = selectData.recordset[0];
    query = `SELECT * FROM insuranceDetails WHERE insuranceDetails.id = ${iid};`;

    doQueryNoRes(query, [], function (selectData) {
      if (empty(selectData.recordset)) winston.error(`Insurance details do not exist for insurance user ${iid}. Cannot send insurance plan creation email.`);

      const companyName = selectData.recordset[0].companyname;

      query = `SELECT * FROM insurancePatientSubscription WHERE insurancePatientSubscription.iid = ${iid};`;
      doQueryNoRes(query, [], function (selectData) {
        if (empty(selectData.recordset)) {
          winston.error(`No subscribers to this insurance. Not sending emails.`);
          return
        }

        const emails = []
        for (i = 0; i < selectData.recordset.length; i++) {
          emails.push(selectData.recordset[i].patientemail);
        }

        mail(emails, `${companyName} updated an insurance plan!`, insurancePlanUpdate
          .replace("_INSURANCE_NAME_", companyName).replace("_INSURANCE_NAME_", companyName).replace("_INSURANCE_PREMIUM_", planData.premium)
          .replace("_INSURANCE_DEDUCTIBLE_", planData.deductible).replace("_INSURANCE_PLAN_", planData.planname))
          .then(() => {
          }).catch((error) => {
            winston.error(`Failed to send email to ${patientEmail}.`);
          });

      });
    });
  });
}

//#endregion

module.exports = router;

insurancePlanCreated = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>InsurancePlanCreated</title> <!--[if (mso 16)]><style type="text/css">     a {text-decoration: none;}     </style><![endif]--> <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> <!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>
96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml><![endif]--><style type="text/css">
#outlook a {	padding:0;}.ExternalClass {	width:100%;}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {	line-height:100%;}.es-button {	mso-style-priority:100!important;	text-decoration:none!important;}a[x-apple-data-detectors] {	color:inherit!important;	text-decoration:none!important;	font-size:inherit!important;	font-family:inherit!important;	font-weight:inherit!important;	line-height:inherit!important;}.es-desk-hidden {	display:none;	float:left;	overflow:hidden;	width:0;	max-height:0;	line-height:0;	mso-hide:all;}@media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { 
font-size:30px!important } h2 a { font-size:26px!important } h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button { 
font-size:20px!important; display:block!important; border-width:10px 0px 10px 0px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; 
float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }</style></head><body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div class="es-wrapper-color" style="background-color:#F6F6F6"> <!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f6f6f6"></v:fill> </v:background><![endif]-->
<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top"><tr style="border-collapse:collapse"><td valign="top" style="padding:0;Margin:0"><table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0"><table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr style="border-collapse:collapse">
<td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;padding-bottom:15px"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:24px;font-style:normal;font-weight:normal;color:#333333">Hello!</h2></td></tr><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;padding-top:20px">
<p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">_INSURANCE_NAME_ has created a new insurance plan!<br><br></p></td></tr><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;padding-top:15px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">Here's a quick overview:<br>Premium: $_INSURANCE_PREMIUM_<br>Deductible: $_INSURANCE_DEDUCTIBLE_<br><br>Use the insurance search feature in the patient dashboard to find this plan.<br>Use these search terms: Company Name: _INSURANCE_NAME_ Plan Name: _INSURANCE_PLAN_<br></p></td></tr><tr style="border-collapse:collapse">
<td align="left" style="padding:0;Margin:0;padding-top:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">Be safe and healthy!<br><br>Love,<br>The Apollo Care IT Team<br></p></td></tr></table></td></tr></table></td></tr></table></td></tr></table><table class="es-footer" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0">
<table class="es-footer-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"><tr style="border-collapse:collapse"><td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td style="padding:20px;Margin:0;font-size:0" align="center">
<table width="75%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td style="padding:0;Margin:0;border-bottom:1px solid #CCCCCC;background:none;height:1px;width:100%;margin:0px"></td></tr></table></td></tr><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:11px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:17px;color:#333333">&lt;3 You can unsubscribe from a insurance provider in your patient dashboard &lt;3<br>&lt;3 Apollo Care loves you and wants you to be healthy &lt;3</p></td></tr><tr style="border-collapse:collapse">
<td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:11px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:17px;color:#333333">©2020 Apollo Care<br></p></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body>
</html>
`

insurancePlanUpdate = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>InsurancePlanCreated</title> <!--[if (mso 16)]><style type="text/css">     a {text-decoration: none;}     </style><![endif]--> <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> <!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>
96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml><![endif]--><style type="text/css">
#outlook a {	padding:0;}.ExternalClass {	width:100%;}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {	line-height:100%;}.es-button {	mso-style-priority:100!important;	text-decoration:none!important;}a[x-apple-data-detectors] {	color:inherit!important;	text-decoration:none!important;	font-size:inherit!important;	font-family:inherit!important;	font-weight:inherit!important;	line-height:inherit!important;}.es-desk-hidden {	display:none;	float:left;	overflow:hidden;	width:0;	max-height:0;	line-height:0;	mso-hide:all;}@media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { 
font-size:30px!important } h2 a { font-size:26px!important } h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button { 
font-size:20px!important; display:block!important; border-width:10px 0px 10px 0px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; 
float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }</style></head><body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div class="es-wrapper-color" style="background-color:#F6F6F6"> <!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f6f6f6"></v:fill> </v:background><![endif]-->
<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top"><tr style="border-collapse:collapse"><td valign="top" style="padding:0;Margin:0"><table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0"><table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr style="border-collapse:collapse">
<td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;padding-bottom:15px"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:24px;font-style:normal;font-weight:normal;color:#333333">Hello!</h2></td></tr><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;padding-top:20px">
<p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">_INSURANCE_NAME_ has updated an insurance plan!<br><br></p></td></tr><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;padding-top:15px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">Here's a quick overview:<br>Premium: $_INSURANCE_PREMIUM_<br>Deductible: $_INSURANCE_DEDUCTIBLE_<br><br>Use the insurance search feature in the patient dashboard to find this plan.<br>Use these search terms: Company Name: _INSURANCE_NAME_ Plan Name: _INSURANCE_PLAN_<br></p></td></tr><tr style="border-collapse:collapse">
<td align="left" style="padding:0;Margin:0;padding-top:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">Be safe and healthy!<br><br>Love,<br>The Apollo Care IT Team<br></p></td></tr></table></td></tr></table></td></tr></table></td></tr></table><table class="es-footer" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0">
<table class="es-footer-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"><tr style="border-collapse:collapse"><td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td style="padding:20px;Margin:0;font-size:0" align="center">
<table width="75%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td style="padding:0;Margin:0;border-bottom:1px solid #CCCCCC;background:none;height:1px;width:100%;margin:0px"></td></tr></table></td></tr><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:11px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:17px;color:#333333">&lt;3 You can unsubscribe from a insurance provider in your patient dashboard &lt;3<br>&lt;3 Apollo Care loves you and wants you to be healthy &lt;3</p></td></tr><tr style="border-collapse:collapse">
<td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:11px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:17px;color:#333333">©2020 Apollo Care<br></p></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body>
</html>
`