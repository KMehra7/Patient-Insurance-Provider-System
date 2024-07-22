CREATE TABLE insurancePatientSubscription( 
    id int NOT NULL IDENTITY,
	PRIMARY KEY (id),
	patientemail varchar(255) NULL,
	pid int NULL,
	iid int NULL
);