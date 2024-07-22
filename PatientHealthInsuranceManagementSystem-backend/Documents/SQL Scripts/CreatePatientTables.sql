CREATE TABLE patientBills (
    billid int NOT NULL IDENTITY,
	PRIMARY KEY (billid),
	id int NULL,
	statementdate DATE NULL,
	totalcharges DECIMAL(38, 2) NULL,
	settled BIT DEFAULT 0 NULL,
	description1 varchar(255) NULL,
);

CREATE TABLE patientMedicalData (
    id int NOT NULL,
	PRIMARY KEY (id),
	address1 varchar(255) NULL,
	address2 varchar(255) NULL,
	city varchar(50) NULL,
	state1 varchar(15) NULL,
	zipcode varchar(15) NULL,
	birthdate varchar(15) NULL,
	sex varchar(10) NULL,
	height varchar(10) NULL,
	weight1 varchar(10) NULL,
	bloodtype varchar(7) NULL,
	smoke BIT NULL,
	smokefreq int NULL,
	drink BIT NULL,
	drinkfreq int NULL,
	caffeine BIT NULL,
	caffeinefreq int NULL,
	lat float NULL,
	lng float NULL
);

CREATE TABLE patientUsers (
    id int NOT NULL IDENTITY,
	PRIMARY KEY (id),
    email varchar(255) NULL,
	pword varchar(1024) NULL,
	fname varchar(255) NULL,
	lname varchar(255) NULL,
	phonenumber varchar(50) NULL,
	goauth varchar(50) NULL
); 