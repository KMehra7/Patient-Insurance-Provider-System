CREATE TABLE patientDoctorRelations (
    id int NOT NULL IDENTITY,
	PRIMARY KEY (id),
	pid int NULL,
	did int NULL
);