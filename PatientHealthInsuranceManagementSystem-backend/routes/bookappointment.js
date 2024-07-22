const { doQuery, sql } = require('../db');
const { ValidateBookAppointment, ValidateGetAppointments } = require('../models/bookappointment');
const { ValidateCovidSurvey } = require('../models/covidsurvey');
// const { ValidatePatientMedicalData } = require('../models/puser');
// const constants = require('../utils/constants');
const { geocoder } = require('../utils/geocoder');
const addWeekday = require('../utils/addWeekday');
const mail = require('../utils/mail');
// const storage = require('../utils/storage');
const bcrypt = require('bcryptjs');
const empty = require('is-empty');
const moment = require('moment');
const winston = require('winston');
const express = require('express');
const router = express.Router();

// GET Appointments
router.post('/get', async function (req, res) {
    // Data Validation
    const { error } = ValidateGetAppointments(req.body);
    if (error) return res.status(400).send({ error: error.message });

    const enddate = addWeekday(moment.utc(req.body.startdate), 5).format('MM-DD-YYYY');

    const query = `SELECT * FROM appointments
    WHERE did = @did AND appointmentdate BETWEEN @startdate AND @enddate`
    const params = [
        { name: 'did', sqltype: sql.Int, value: req.body.did },
        { name: 'startdate', sqltype: sql.Date, value: req.body.startdate },
        { name: 'enddate', sqltype: sql.Date, value: enddate }
    ];

    doQuery(res, query, params, async function (selectData) {
        return res.status(200).send(selectData.recordset);
    });
});

async function saveCovidSurvey(req, res, callback) {
    const { error } = ValidateCovidSurvey(req.body.survey);
    if (error) {
        callback(false);
        return res.status(400).send({ error: error.message });
    }

    const survey = req.body.survey;

    let query = "SELECT * FROM patientCovidSurvey WHERE id = @id;";
    let params = [
        { name: 'id', sqltype: sql.Int, value: survey.id }
    ];

    doQuery(res, query, params, function (selectData) {
        params = [
            { name: 'id', sqltype: sql.Int, value: survey.id },
            { name: 'surveydate', sqltype: sql.Date, value: moment.utc().format('YYYY-MM-DD') },
            { name: 'symptoms', sqltype: sql.Bit, value: survey.symptoms === "YES" },
            { name: 'contactwithcovidperson', sqltype: sql.Bit, value: survey.contactwithcovidperson === "YES" },
            { name: 'covidpositivetest', sqltype: sql.Bit, value: survey.covidpositivetest === "YES" },
            { name: 'selfmonitor', sqltype: sql.Bit, value: survey.selfmonitor === "YES" },
            { name: 'requesttest', sqltype: sql.Bit, value: survey.requesttest === "YES" }
        ];

        // Create it
        if (empty(selectData.recordset)) {
            query = `INSERT INTO patientCovidSurvey (id, surveydate, symptoms, contactwithcovidperson, covidpositivetest, selfmonitor, requesttest)  
                OUTPUT INSERTED.* 
                VALUES (@id, @surveydate, @symptoms, @contactwithcovidperson, @covidpositivetest, @selfmonitor, @requesttest);`;
            doQuery(res, query, params, function (insertData) {
                if (empty(insertData.recordset)) {
                    callback(false);
                    return res.status(500).send({ error: "Saving COVID-19 survey failed." });
                } else {
                    callback(true);
                }
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
                if (empty(updateData.recordset)) {
                    callback(false);
                    return res.status(500).send({ error: "Saving COVID-19 survey failed." });
                } else {
                    callback(true);
                }
            });
        }
    });
}

function createChatRooms(data) {

    let query = `insert into last_message_view (user_id, user_type, room_id) values (${data.pid}, 'patient', '${data.id}appt'), (${data.did}, 'doctor', '${data.id}appt');`;

    doQuery(null, query, [], () => {});
}

// CREATE Appointment
// FLOW
//  -> Check appointment slot is open
//      -> Save new appointment in DB
//          -> Grab e-mails for email confirmation
//              -> DONE!
router.post('/', async function (req, res) {

    saveCovidSurvey(req, res, function(complete) {
        if(complete) {
            // Data Validation
            const { error } = ValidateBookAppointment(req.body);
            if (error) return res.status(400).send({ error: error.message });

            let query = `SELECT * FROM appointments 
            WHERE did = @did AND appointmentdate = @appointmentdate AND starttime = @starttime;`
            let params = [
                { name: 'did', sqltype: sql.Int, value: req.body.did },
                { name: 'appointmentdate', sqltype: sql.Date, value: req.body.appointmentdate },
                { name: 'starttime', sqltype: sql.Int, value: req.body.starttime }
            ];
            // Check if doctor is available
            doQuery(res, query, params, async function (selectData) {

                if (!empty(selectData.recordset)) return res.status(400).send({ error: "Doctor is already booked for selected time slot." });

                endtime = req.body.starttime + 30;
                query = `INSERT INTO appointments (did, pid, appointmentdate, starttime, endtime) 
                    OUTPUT INSERTED.*
                    VALUES (@did, @pid, @appointmentdate, @starttime, @endtime);`;
                params = [
                    { name: 'did', sqltype: sql.Int, value: req.body.did },
                    { name: 'pid', sqltype: sql.Int, value: req.body.pid },
                    { name: 'appointmentdate', sqltype: sql.Date, value: req.body.appointmentdate },
                    { name: 'starttime', sqltype: sql.Int, value: req.body.starttime },
                    { name: 'endtime', sqltype: sql.Int, value: endtime }
                ];
                // Save the appointment in DB 
                doQuery(res, query, params, function (insertData) {
                    if (empty(insertData.recordset)) return res.status(400).send({ error: "Failed to create appointment." });

                    let appointmentData = insertData.recordset[0];

                    createChatRooms(appointmentData);

                    query = `SELECT email, fname, lname FROM doctorUsers
                        WHERE id = @did
                        UNION ALL
                        SELECT email, fname, lname FROM patientUsers
                        WHERE id = @pid;`
                    params = [
                        { name: 'did', sqltype: sql.Int, value: req.body.did },
                        { name: 'pid', sqltype: sql.Int, value: req.body.pid }
                    ];
                    // Grab e-mails for the email confirmation
                    doQuery(res, query, params, async function (selectData) {
                        if (empty(selectData.recordset)) return res.status(400).send({ error: "Doctor and Patient are not in the system." });

                        let doctor = selectData.recordset[0];
                        let patient = selectData.recordset[1];

                        // Can't send e-mails, kill the request?
                        // Honestly shouldn't be feasible but we'll log it if it comes up
                        if (empty(doctor) || empty(patient))
                            winston.error('Doctor or Patient is empty. Email will fail to send but appointment created successfully?');


                        let minutes = (appointmentData.starttime % 60);
                        if (minutes !== 30) {
                            minutes = "00"
                        }
                        mail(
                            [doctor.email, patient.email],
                            "Appointment Confirmation",
                            appointmentEmail.replace('_P_FIRST_NAME', patient.fname).replace('_P_LAST_NAME', patient.lname)
                                .replace('_D_LAST_NAME', doctor.lname).replace('_APPOINTMENT_DATE_', moment.utc(appointmentData.appointmentdate).format('YYYY-MM-DD'))
                                .replace('_APPOINTMENT_TIME_', (Math.floor(appointmentData.starttime / 60) + ":" + minutes)))

                            .then(() => {
                                return res.status(200).send(appointmentData);
                            }).catch((error) => {
                                return res.status(500).send({ error: `Confirmation emails failed to send.` });
                            });
                    });
                });
            });
        }
    })
});


// UPDATE APPOINTMENT
router.put('/', async function (req, res) {
    return res.status(404).send({ error: 'Not Found' });
});

router.delete('/', async function (req, res) {
    return res.status(404).send({ error: 'Not Found' });
});

module.exports = router;

const appointmentEmail = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><head><meta charset="UTF-8"><meta content="width=device-width, initial-scale=1" name="viewport"><meta name="x-apple-disable-message-reformatting"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta content="telephone=no" name="format-detection"><title>AppointmentConfirmation</title> <!--[if (mso 16)]><style type="text/css">     a {text-decoration: none;}     </style><![endif]--> <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> <!--[if gte mso 9]><xml> <o:OfficeDocumentSettings> <o:AllowPNG></o:AllowPNG> <o:PixelsPerInch>
96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml><![endif]--><style type="text/css">
#outlook a {	padding:0;}.ExternalClass {	width:100%;}.ExternalClass,.ExternalClass p,.ExternalClass span,.ExternalClass font,.ExternalClass td,.ExternalClass div {	line-height:100%;}.es-button {	mso-style-priority:100!important;	text-decoration:none!important;}a[x-apple-data-detectors] {	color:inherit!important;	text-decoration:none!important;	font-size:inherit!important;	font-family:inherit!important;	font-weight:inherit!important;	line-height:inherit!important;}.es-desk-hidden {	display:none;	float:left;	overflow:hidden;	width:0;	max-height:0;	line-height:0;	mso-hide:all;}@media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { 
font-size:30px!important } h2 a { font-size:26px!important } h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button { 
font-size:20px!important; display:block!important; border-width:10px 0px 10px 0px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; 
float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }</style></head><body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"><div class="es-wrapper-color" style="background-color:#F6F6F6"> <!--[if gte mso 9]><v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t"> <v:fill type="tile" color="#f6f6f6"></v:fill> </v:background><![endif]-->
<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top"><tr style="border-collapse:collapse"><td valign="top" style="padding:0;Margin:0"><table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0"><table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"><tr style="border-collapse:collapse">
<td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;padding-bottom:15px"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:24px;font-style:normal;font-weight:normal;color:#333333">Hello!</h2></td></tr><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;padding-top:20px">
<p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">This is an appointment confirmation. Please mark it in your calendars. The appointment is for:<br><br>_P_FIRST_NAME _P_LAST_NAME with Dr. _D_LAST_NAME<br>on _APPOINTMENT_DATE_ at _APPOINTMENT_TIME_<br><br>Please arrive 10 minutes before hand to handle any paperwork that may be needed.<br></p></td></tr><tr style="border-collapse:collapse"><td align="left" style="padding:0;Margin:0;padding-top:15px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">Be safe and healthy!<br><br></p>
<p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">Love,</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333">The Apollo Care IT Team</p></td></tr></table></td></tr></table></td></tr></table></td></tr></table><table class="es-footer" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0">
<table class="es-footer-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"><tr style="border-collapse:collapse"><td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px"><table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td valign="top" align="center" style="padding:0;Margin:0;width:560px"><table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td style="padding:20px;Margin:0;font-size:0" align="center">
<table width="75%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"><tr style="border-collapse:collapse"><td style="padding:0;Margin:0;border-bottom:1px solid #CCCCCC;background:none;height:1px;width:100%;margin:0px"></td></tr></table></td></tr><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:11px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:17px;color:#333333">&lt;3 Apollo Care loves you and wants you to be healthy &lt;3<br></p></td></tr><tr style="border-collapse:collapse"><td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px">
<p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:11px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:17px;color:#333333">© 2020 Apollo Care<br></p></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body>
</html>
`