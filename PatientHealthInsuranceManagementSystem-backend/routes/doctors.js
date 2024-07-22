const { doQuery, sql } = require('../db');
const { ValidatePassword, ValidateUpdateUser } = require('../models/user');
const { ValidateDoctorDetails } = require('../models/duser');
const { geocoder } = require('../utils/geocoder');
const addWeekday = require('../utils/addWeekday');
const storage = require('../utils/storage');
const bcrypt = require('bcryptjs');
const empty = require('is-empty');
const winston = require('winston');
const express = require('express');
const moment = require('moment');
const router = express.Router();


// GET doctorUser and doctorDetails
router.get('/:id', async function (req, res) {
  let query = `SELECT *, (SELECT * FROM doctorDetails WHERE doctorUsers.id = doctorDetails.id FOR JSON PATH) AS detail, (SELECT doctorSpecializations.* FROM doctorSpecializations WHERE doctorUsers.id = doctorSpecializations.id FOR JSON PATH) AS specialization FROM doctorUsers WHERE id = ${req.params.id};`;
  let params = [];

  doQuery(res, query, params, function (selectData) {
    if (empty(selectData.recordset)) return res.status(400).send({ error: "Doctor record does not exist." });

    delete selectData.recordset[0].pword;
    delete selectData.recordset[0].goauth;

    return res.status(200).send({ ...selectData.recordset.map(item => { let s = empty(JSON.parse(item.specialization)) ? {} : JSON.parse(item.specialization)[0]; delete item.specialization; return ({ ...item, detail: empty(JSON.parse(item.detail)) ? {} : JSON.parse(item.detail)[0], specializations: s, usertype: 'doctor' }) })[0] });
  });
});

//#region PUT doctorUser/password/profilepic 
router.put('/user', async function (req, res) {
  // Data Validation
  const { error } = ValidateUpdateUser(req.body);
  if (error) return res.status(400).send({ error: error.message });

  // Make sure email isn't already registered in proper database table!!
  let query = `SELECT * FROM doctorUsers WHERE email = @email AND id <> @id;`;
  let params = [
    { name: 'email', sqltype: sql.VarChar(255), value: req.body.email },
    { name: 'id', sqltype: sql.Int, value: req.body.id }
  ];

  doQuery(res, query, params, async function (selectData) {
    let user = empty(selectData.recordset) ? [] : selectData.recordset[0];
    if (!empty(user)) return res.status(400).send({ error: `E-mail already registered.` });

    let query = `UPDATE doctorUsers 
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

  // Grab user
  let query = `SELECT * FROM doctorUsers WHERE id = ${req.body.id};`;
  let params = [];
  doQuery(res, query, params, async function (selectData) {
    if (empty(selectData.recordset)) return res.status(400).send({ error: "Doctor record does not exist." })
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
    query = `UPDATE doctorUsers 
    SET pword = @pword
    OUTPUT INSERTED.* 
    WHERE id = @id;`;
    params = [
      { name: 'id', sqltype: sql.Int, value: req.body.id },
      { name: 'pword', sqltype: sql.VarChar(255), value: hashedPassword }
    ];

    doQuery(res, query, params, async function (updateData) {
      if (empty(updateData.recordset)) return res.status(500).send({ error: "Data not saved." })

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

//#region POST/PUT doctorDetails

// Creates doctorDetails record for doctorUser
router.post('/onboard', async function (req, res) {
  // Data Validation
  const { error } = ValidateDoctorDetails(req.body);
  if (error) return res.status(400).send({ error: error.message });

  // Save Specializations
  let specializations = [];
  let query = `INSERT INTO doctorSpecializations (id, allergy, immunology, anesthesiology, dermatology, diagnosticradiology, emergencymedicine, familymedicine, internalmedicine, medicalgenetics, neurology, nuclearmedicine, obstetrics, gynecology, ophthalmology, pathology, pediatrics, physicalmedicine, rehabilitation, preventivemedicine, psychiatry, radiationoncology, surgery, urology)
    OUTPUT INSERTED.*
    VALUES(@id, @allergy, @immunology, @anesthesiology, @dermatology, @diagnosticradiology, @emergencymedicine, @familymedicine, @internalmedicine, @medicalgenetics, @neurology, @nuclearmedicine, @obstetrics, @gynecology, @ophthalmology, @pathology, @pediatrics, @physicalmedicine, @rehabilitation, @preventivemedicine, @psychiatry, @radiationoncology, @surgery, @urology)`;
  let params = [
    { name: 'id', sqltype: sql.Int, value: req.body.id },
    { name: 'allergy', sqltype: sql.Bit, value: req.body.specializations['allergy'] },
    { name: 'immunology', sqltype: sql.Bit, value: req.body.specializations['immunology'] },
    { name: 'anesthesiology', sqltype: sql.Bit, value: req.body.specializations['anesthesiology'] },
    { name: 'dermatology', sqltype: sql.Bit, value: req.body.specializations['dermatology'] },
    { name: 'diagnosticradiology', sqltype: sql.Bit, value: req.body.specializations['diagnosticradiology'] },
    { name: 'emergencymedicine', sqltype: sql.Bit, value: req.body.specializations['emergencymedicine'] },
    { name: 'familymedicine', sqltype: sql.Bit, value: req.body.specializations['familymedicine'] },
    { name: 'internalmedicine', sqltype: sql.Bit, value: req.body.specializations['internalmedicine'] },
    { name: 'medicalgenetics', sqltype: sql.Bit, value: req.body.specializations['medicalgenetics'] },
    { name: 'neurology', sqltype: sql.Bit, value: req.body.specializations['neurology'] },
    { name: 'nuclearmedicine', sqltype: sql.Bit, value: req.body.specializations['nuclearmedicine'] },
    { name: 'obstetrics', sqltype: sql.Bit, value: req.body.specializations['obstetrics'] },
    { name: 'gynecology', sqltype: sql.Bit, value: req.body.specializations['gynecology'] },
    { name: 'ophthalmology', sqltype: sql.Bit, value: req.body.specializations['ophthalmology'] },
    { name: 'pathology', sqltype: sql.Bit, value: req.body.specializations['pathology'] },
    { name: 'pediatrics', sqltype: sql.Bit, value: req.body.specializations['pediatrics'] },
    { name: 'physicalmedicine', sqltype: sql.Bit, value: req.body.specializations['physicalmedicine'] },
    { name: 'rehabilitation', sqltype: sql.Bit, value: req.body.specializations['rehabilitation'] },
    { name: 'preventivemedicine', sqltype: sql.Bit, value: req.body.specializations['preventivemedicine'] },
    { name: 'psychiatry', sqltype: sql.Bit, value: req.body.specializations['psychiatry'] },
    { name: 'radiationoncology', sqltype: sql.Bit, value: req.body.specializations['radiationoncology'] },
    { name: 'surgery', sqltype: sql.Bit, value: req.body.specializations['surgery'] },
    { name: 'urology', sqltype: sql.Bit, value: req.body.specializations['urology'] }
  ];


  doQuery(res, query, params, async function (insertData) {
    if (empty(insertData.recordset)) return res.status(500).send({ error: "Data not saved." })

    specializations = insertData.recordset[0];

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

    query = `INSERT INTO doctorDetails (id, practicename, address1, address2, city, state1, zipcode, npinumber, specializations, treatscovid, bedstaken, bedsmax, lat, lng) 
      OUTPUT INSERTED.* 
      VALUES (@id, @practicename, @address1, @address2, @city, @state1, @zipcode, @npinumber, @specializations, @treatscovid, @bedstaken, @bedsmax, @lat, @lng);`;
    params = [
      { name: 'id', sqltype: sql.Int, value: req.body.id },
      { name: 'practicename', sqltype: sql.VarChar(255), value: req.body.practicename },
      { name: 'address1', sqltype: sql.VarChar(255), value: req.body.address1 },
      { name: 'address2', sqltype: sql.VarChar(255), value: req.body.address2 },
      { name: 'city', sqltype: sql.VarChar(50), value: req.body.city },
      { name: 'state1', sqltype: sql.VarChar(15), value: req.body.state1 },
      { name: 'zipcode', sqltype: sql.VarChar(15), value: req.body.zipcode },
      { name: 'npinumber', sqltype: sql.VarChar(10), value: req.body.npinumber },
      { name: 'specializations', sqltype: sql.Int, value: req.body.id },
      { name: 'treatscovid', sqltype: sql.Bit, value: req.body.treatscovid },
      { name: 'bedstaken', sqltype: sql.Int, value: req.body.bedstaken },
      { name: 'bedsmax', sqltype: sql.Int, value: req.body.bedsmax },
      { name: 'lat', sqltype: sql.Float, value: lat },
      { name: 'lng', sqltype: sql.Float, value: lng }
    ];



    doQuery(res, query, params, async function (insertData) {
      if (empty(insertData.recordset)) return res.status(500).send({ error: "Data not saved." })

      insertData.recordset[0].specializations = specializations;

      return res.status(200).send({ specializations: specializations, detail: insertData.recordset[0] });
    });
  });
});

// Updates doctorDetails record for doctorUser
router.put('/details', async function (req, res) {
  // Data Validation
  const { error } = ValidateDoctorDetails(req.body);
  if (error) return res.status(400).send({ error: error.message });

  // Save Specializations
  let specializations = [];
  let query = `UPDATE doctorSpecializations
   SET allergy = @allergy, immunology = @immunology, anesthesiology = @anesthesiology, dermatology = @dermatology, diagnosticradiology = @diagnosticradiology, 
   emergencymedicine = @emergencymedicine, familymedicine = @familymedicine, internalmedicine = @internalmedicine, medicalgenetics = @medicalgenetics, neurology = @neurology, 
   nuclearmedicine = @nuclearmedicine, obstetrics = @obstetrics, gynecology = @gynecology, ophthalmology = @ophthalmology, pathology = @pathology, pediatrics = @pediatrics, 
   physicalmedicine = @physicalmedicine, rehabilitation = @rehabilitation, preventivemedicine = @preventivemedicine, psychiatry = @psychiatry, radiationoncology = @radiationoncology, 
   surgery = @surgery, urology = @urology
   OUTPUT INSERTED.* WHERE id = @id`;
  let params = [
    { name: 'id', sqltype: sql.Int, value: req.body.id },
    { name: 'allergy', sqltype: sql.Bit, value: req.body.specializations['allergy'] },
    { name: 'immunology', sqltype: sql.Bit, value: req.body.specializations['immunology'] },
    { name: 'anesthesiology', sqltype: sql.Bit, value: req.body.specializations['anesthesiology'] },
    { name: 'dermatology', sqltype: sql.Bit, value: req.body.specializations['dermatology'] },
    { name: 'diagnosticradiology', sqltype: sql.Bit, value: req.body.specializations['diagnosticradiology'] },
    { name: 'emergencymedicine', sqltype: sql.Bit, value: req.body.specializations['emergencymedicine'] },
    { name: 'familymedicine', sqltype: sql.Bit, value: req.body.specializations['familymedicine'] },
    { name: 'internalmedicine', sqltype: sql.Bit, value: req.body.specializations['internalmedicine'] },
    { name: 'medicalgenetics', sqltype: sql.Bit, value: req.body.specializations['medicalgenetics'] },
    { name: 'neurology', sqltype: sql.Bit, value: req.body.specializations['neurology'] },
    { name: 'nuclearmedicine', sqltype: sql.Bit, value: req.body.specializations['nuclearmedicine'] },
    { name: 'obstetrics', sqltype: sql.Bit, value: req.body.specializations['obstetrics'] },
    { name: 'gynecology', sqltype: sql.Bit, value: req.body.specializations['gynecology'] },
    { name: 'ophthalmology', sqltype: sql.Bit, value: req.body.specializations['ophthalmology'] },
    { name: 'pathology', sqltype: sql.Bit, value: req.body.specializations['pathology'] },
    { name: 'pediatrics', sqltype: sql.Bit, value: req.body.specializations['pediatrics'] },
    { name: 'physicalmedicine', sqltype: sql.Bit, value: req.body.specializations['physicalmedicine'] },
    { name: 'rehabilitation', sqltype: sql.Bit, value: req.body.specializations['rehabilitation'] },
    { name: 'preventivemedicine', sqltype: sql.Bit, value: req.body.specializations['preventivemedicine'] },
    { name: 'psychiatry', sqltype: sql.Bit, value: req.body.specializations['psychiatry'] },
    { name: 'radiationoncology', sqltype: sql.Bit, value: req.body.specializations['radiationoncology'] },
    { name: 'surgery', sqltype: sql.Bit, value: req.body.specializations['surgery'] },
    { name: 'urology', sqltype: sql.Bit, value: req.body.specializations['urology'] }
  ];
  doQuery(res, query, params, async function (updateData) {
    if (empty(updateData.recordset)) return res.status(500).send({ error: "Data not saved." })

    specializations = updateData.recordset[0];

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

    query = `UPDATE doctorDetails 
      SET practicename = @practicename, address1 = @address1, address2 = @address2, city = @city, state1 = @state1, zipcode = @zipcode,
      npinumber = @npinumber, specializations = @specializations, treatscovid = @treatscovid, bedstaken = @bedstaken, bedsmax = @bedsmax, lng = @lng, lat = @lat
      OUTPUT INSERTED.* WHERE id = @id`;
    params = [
      { name: 'id', sqltype: sql.Int, value: req.body.id },
      { name: 'practicename', sqltype: sql.VarChar(255), value: req.body.practicename },
      { name: 'address1', sqltype: sql.VarChar(255), value: req.body.address1 },
      { name: 'address2', sqltype: sql.VarChar(255), value: req.body.address2 },
      { name: 'city', sqltype: sql.VarChar(50), value: req.body.city },
      { name: 'state1', sqltype: sql.VarChar(15), value: req.body.state1 },
      { name: 'zipcode', sqltype: sql.VarChar(15), value: req.body.zipcode },
      { name: 'npinumber', sqltype: sql.VarChar(10), value: req.body.npinumber },
      { name: 'specializations', sqltype: sql.Int, value: req.body.id },
      { name: 'treatscovid', sqltype: sql.Bit, value: req.body.treatscovid },
      { name: 'bedstaken', sqltype: sql.Int, value: req.body.bedstaken },
      { name: 'bedsmax', sqltype: sql.Int, value: req.body.bedsmax },
      { name: 'lat', sqltype: sql.Float, value: lat },
      { name: 'lng', sqltype: sql.Float, value: lng }
    ];

    doQuery(res, query, params, function (updateData) {
      if (empty(updateData.recordset)) return res.status(500).send({ error: "Data not saved." })

      return res.status(200).send({ detail: updateData.recordset[0], specializations: specializations });
    });
  });
});

//#endregion

//#region GET Doctor's Patient Details

// Gets doctorUser's unread message appointments
router.get('/:id/unread/myappointments', async function (req, res) {

  let query = `SELECT id, starttime, endtime, appointmentdate, pid,
        (SELECT patientUsers.id, patientUsers.fname, patientUsers.lname, patientUsers.email, patientUsers.phonenumber FROM patientUsers where patientUsers.id = appointments.pid FOR JSON PATH) as patientBasic,
        (SELECT * FROM patientMedicalData WHERE appointments.pid = patientMedicalData.id FOR JSON PATH) AS patientDetail, 
        (SELECT * FROM patientCovidSurvey WHERE appointments.pid = patientCovidSurvey.id FOR JSON PATH) AS patientSurvey,
        (SELECT insurancePlans.*, insuranceDetails.companyname, insuranceDetails.address1, insuranceDetails.address2, insuranceDetails.city, insuranceDetails.state1, insuranceDetails.zipcode, insuranceDetails.lng, insuranceDetails.lat FROM insurancePlans inner join patientInsurancePlans on patientInsurancePlans.planid = insurancePlans.id inner join insuranceDetails on insuranceDetails.id = insurancePlans.iid WHERE patientInsurancePlans.pid = appointments.pid FOR JSON PATH) AS patientInsurance 
        FROM appointments WHERE did = @did order by appointmentdate desc, starttime asc; `;
  let params = [
    { name: 'did', sqltype: sql.Int, value: req.params.id }
  ];

  doQuery(res, query, params, function (selectData) {
    res.send(selectData.recordset.map(r => {
      const record = r;
      const patientBasic = empty(JSON.parse(record.patientBasic)) ? {} : JSON.parse(record.patientBasic)[0];
      const patientDetail = empty(JSON.parse(record.patientDetail)) ? {} : JSON.parse(record.patientDetail)[0];
      const patientSurvey = empty(JSON.parse(record.patientSurvey)) ? {} : JSON.parse(record.patientSurvey)[0];
      const patientInsurance = empty(JSON.parse(record.patientInsurance)) ? {} : JSON.parse(record.patientInsurance)[0];
      const patient = {...patientBasic, detail: patientDetail, survey: patientSurvey, insurance: patientInsurance}; 
      delete record["patientBasic"];
      delete record["patientDetail"];
      delete record["patientSurvey"];
      delete record["patientInsurance"];
      return {...record, patient: patient};
    }));
  });
});

// Gets doctorUser's patients'
router.get('/:id/myappointments', async function (req, res) {

  const enddate = addWeekday(moment.utc(req.query.startdate), 5).format('MM-DD-YYYY');

  let query = `SELECT id, starttime, endtime, appointmentdate, pid,
        (SELECT patientUsers.id, patientUsers.fname, patientUsers.lname, patientUsers.email, patientUsers.phonenumber FROM patientUsers where patientUsers.id = appointments.pid FOR JSON PATH) as patientBasic,
        (SELECT * FROM patientMedicalData WHERE appointments.pid = patientMedicalData.id FOR JSON PATH) AS patientDetail, 
        (SELECT * FROM patientCovidSurvey WHERE appointments.pid = patientCovidSurvey.id FOR JSON PATH) AS patientSurvey,
        (SELECT insurancePlans.*, insuranceDetails.companyname, insuranceDetails.address1, insuranceDetails.address2, insuranceDetails.city, insuranceDetails.state1, insuranceDetails.zipcode, insuranceDetails.lng, insuranceDetails.lat FROM insurancePlans inner join patientInsurancePlans on patientInsurancePlans.planid = insurancePlans.id inner join insuranceDetails on insuranceDetails.id = insurancePlans.iid WHERE patientInsurancePlans.pid = appointments.pid FOR JSON PATH) AS patientInsurance 
        FROM appointments WHERE did = @did AND appointmentdate BETWEEN @startdate AND @enddate; `;
  let params = [
    { name: 'did', sqltype: sql.Int, value: req.params.id },
    { name: 'startdate', sqltype: sql.Date, value: req.query.startdate },
    { name: 'enddate', sqltype: sql.Date, value: enddate }
  ];

  doQuery(res, query, params, function (selectData) {
    res.send(selectData.recordset.map(r => {
      const record = r;
      const patientBasic = empty(JSON.parse(record.patientBasic)) ? {} : JSON.parse(record.patientBasic)[0];
      const patientDetail = empty(JSON.parse(record.patientDetail)) ? {} : JSON.parse(record.patientDetail)[0];
      const patientSurvey = empty(JSON.parse(record.patientSurvey)) ? {} : JSON.parse(record.patientSurvey)[0];
      const patientInsurance = empty(JSON.parse(record.patientInsurance)) ? {} : JSON.parse(record.patientInsurance)[0];
      const patient = {...patientBasic, detail: patientDetail, survey: patientSurvey, insurance: patientInsurance}; 
      delete record["patientBasic"];
      delete record["patientDetail"];
      delete record["patientSurvey"];
      delete record["patientInsurance"];
      return {...record, patient: patient};
    }));
  });
});

//#endregion

module.exports = router;