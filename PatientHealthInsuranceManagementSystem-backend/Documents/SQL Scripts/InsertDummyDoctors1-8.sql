INSERT INTO dbo.doctorUsers (email, pword, fname, lname, phonenumber)
VALUES ('dummydoctor1@gmail.com', 'dummydoctor1', 'dummy1', 'doctor1', '201-201-2010'); 

INSERT INTO dbo.doctorUsers (email, pword, fname, lname, phonenumber)
VALUES ('dummydoctor2@gmail.com', 'dummydoctor2', 'dummy2', 'doctor2', '201-201-2010'); 

INSERT INTO dbo.doctorUsers (email, pword, fname, lname, phonenumber)
VALUES ('dummydoctor3@gmail.com', 'dummydoctor3', 'dummy3', 'doctor3', '201-201-2010'); 

INSERT INTO dbo.doctorUsers (email, pword, fname, lname, phonenumber)
VALUES ('dummydoctor4@gmail.com', 'dummydoctor4', 'dummy4', 'doctor4', '201-201-2010'); 

INSERT INTO dbo.doctorUsers (email, pword, fname, lname, phonenumber)
VALUES ('dummydoctor5@gmail.com', 'dummydoctor5', 'dummy5', 'doctor5', '201-201-2010'); 

INSERT INTO dbo.doctorUsers (email, pword, fname, lname, phonenumber)
VALUES ('dummydoctor6@gmail.com', 'dummydoctor6', 'dummy6', 'doctor6', '201-201-2010'); 

INSERT INTO dbo.doctorUsers (email, pword, fname, lname, phonenumber)
VALUES ('dummydoctor7@gmail.com', 'dummydoctor7', 'dummy7', 'doctor7', '201-201-2010'); 

INSERT INTO dbo.doctorUsers (email, pword, fname, lname, phonenumber)
VALUES ('dummydoctor8@gmail.com', 'dummydoctor8', 'dummy8', 'doctor8', '201-201-2010');

INSERT INTO dbo.doctorSpecializations(id, allergy, immunology, anesthesiology, dermatology, diagnosticradiology, emergencymedicine, familymedicine, internalmedicine, medicalgenetics, neurology, nuclearmedicine, obstetrics, gynecology, ophthalmology, pathology, pediatrics, physicalmedicine, rehabilitation, preventivemedicine, psychiatry, radiationoncology, surgery, urology)
VALUES(12, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO dbo.doctorDetails (id, practicename, address1, address2, city, state1, zipcode, npinumber, specializations, treatscovid, bedsavailable, bedsmax)
VALUES (12, 'Dummy Doctor''s Practice 3', '527 E 1st St', 'N/A', 'Bloomington', 'IN', '47401', '1234567890', 12, 0, 0, 0); 

INSERT INTO dbo.doctorSpecializations(id, allergy, immunology, anesthesiology, dermatology, diagnosticradiology, emergencymedicine, familymedicine, internalmedicine, medicalgenetics, neurology, nuclearmedicine, obstetrics, gynecology, ophthalmology, pathology, pediatrics, physicalmedicine, rehabilitation, preventivemedicine, psychiatry, radiationoncology, surgery, urology)
VALUES(4, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO dbo.doctorDetails (id, practicename, address1, address2, city, state1, zipcode, npinumber, specializations, treatscovid, bedsavailable, bedsmax)
VALUES (4, 'Hospital Joy', '525 E 1st St', 'N/A', 'Bloomington', 'IN', '47401', '1234567890', 4, 1, 1, 10); 

INSERT INTO dbo.doctorSpecializations(id, allergy, immunology, anesthesiology, dermatology, diagnosticradiology, emergencymedicine, familymedicine, internalmedicine, medicalgenetics, neurology, nuclearmedicine, obstetrics, gynecology, ophthalmology, pathology, pediatrics, physicalmedicine, rehabilitation, preventivemedicine, psychiatry, radiationoncology, surgery, urology)
VALUES(5, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO dbo.doctorDetails (id, practicename, address1, address2, city, state1, zipcode, npinumber, specializations, treatscovid, bedsavailable, bedsmax)
VALUES (5, 'Medical Waterfall Practice', '521 E 1st St', 'N/A', 'Bloomington', 'IN', '47401', '1234567890', 5, 1, 20, 20); 

INSERT INTO dbo.doctorSpecializations(id, allergy, immunology, anesthesiology, dermatology, diagnosticradiology, emergencymedicine, familymedicine, internalmedicine, medicalgenetics, neurology, nuclearmedicine, obstetrics, gynecology, ophthalmology, pathology, pediatrics, physicalmedicine, rehabilitation, preventivemedicine, psychiatry, radiationoncology, surgery, urology)
VALUES(6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0);
INSERT INTO dbo.doctorDetails (id, practicename, address1, address2, city, state1, zipcode, npinumber, specializations, treatscovid, bedsavailable, bedsmax)
VALUES (6, 'Dummy Doctor''s Practice 6', '519 E 1st St', 'N/A', 'Bloomington', 'IN', '47401', '1234567890', 6, 0, 0, 0); 

INSERT INTO dbo.doctorSpecializations(id, allergy, immunology, anesthesiology, dermatology, diagnosticradiology, emergencymedicine, familymedicine, internalmedicine, medicalgenetics, neurology, nuclearmedicine, obstetrics, gynecology, ophthalmology, pathology, pediatrics, physicalmedicine, rehabilitation, preventivemedicine, psychiatry, radiationoncology, surgery, urology)
VALUES(7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0);
INSERT INTO dbo.doctorDetails (id, practicename, address1, address2, city, state1, zipcode, npinumber, specializations, treatscovid, bedsavailable, bedsmax)
VALUES (7, 'Joe''s Crab Stack Hospital', '515 E 1st St', 'N/A', 'Bloomington', 'IN', '47401', '1234567890', 7, 1, 1, 2); 

INSERT INTO dbo.doctorSpecializations(id, allergy, immunology, anesthesiology, dermatology, diagnosticradiology, emergencymedicine, familymedicine, internalmedicine, medicalgenetics, neurology, nuclearmedicine, obstetrics, gynecology, ophthalmology, pathology, pediatrics, physicalmedicine, rehabilitation, preventivemedicine, psychiatry, radiationoncology, surgery, urology)
VALUES(8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
INSERT INTO dbo.doctorDetails (id, practicename, address1, address2, city, state1, zipcode, npinumber, specializations, treatscovid, bedsavailable, bedsmax)
VALUES (8, 'Dummy Doctor''s Practice 8', '509 E 1st St', 'N/A', 'Bloomington', 'IN', '47401', '1234567890', 8, 0, 5, 10); 

INSERT INTO dbo.doctorSpecializations(id, allergy, immunology, anesthesiology, dermatology, diagnosticradiology, emergencymedicine, familymedicine, internalmedicine, medicalgenetics, neurology, nuclearmedicine, obstetrics, gynecology, ophthalmology, pathology, pediatrics, physicalmedicine, rehabilitation, preventivemedicine, psychiatry, radiationoncology, surgery, urology)
VALUES(9, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO dbo.doctorDetails (id, practicename, address1, address2, city, state1, zipcode, npinumber, specializations, treatscovid, bedsavailable, bedsmax)
VALUES (9, 'Dummy Doctor''s Practice 9', '507 E 1st St', 'N/A', 'Bloomington', 'IN', '47401', '1234567890', 9, 1, 2, 5); 

INSERT INTO dbo.doctorSpecializations(id, allergy, immunology, anesthesiology, dermatology, diagnosticradiology, emergencymedicine, familymedicine, internalmedicine, medicalgenetics, neurology, nuclearmedicine, obstetrics, gynecology, ophthalmology, pathology, pediatrics, physicalmedicine, rehabilitation, preventivemedicine, psychiatry, radiationoncology, surgery, urology)
VALUES(10, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO dbo.doctorDetails (id, practicename, address1, address2, city, state1, zipcode, npinumber, specializations, treatscovid, bedsavailable, bedsmax)
VALUES (10, 'Sharpie''s Blue Pen Hospital', '505 E 1st St', 'N/A', 'Bloomington', 'IN', '47401', '1234567890', 10, 0, 0, 0); 