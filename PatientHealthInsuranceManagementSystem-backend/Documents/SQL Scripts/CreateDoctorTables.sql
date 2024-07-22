/* https://www.sgu.edu/blog/medical/ultimate-list-of-medical-specialties/ */

CREATE TABLE doctorSpecializations (
    id int NOT NULL,
	PRIMARY KEY (id),
	allergy BIT NULL,
	immunology BIT NULL,
	anesthesiology BIT NULL,
	dermatology BIT NULL,
	diagnosticradiology BIT NULL,
	emergencymedicine BIT NULL,
	familymedicine BIT NULL,
	internalmedicine BIT NULL,
	medicalgenetics BIT NULL,
	neurology BIT NULL,
	nuclearmedicine BIT NULL,
	obstetrics BIT NULL,
	gynecology BIT NULL,
	ophthalmology BIT NULL,
	pathology BIT NULL,
	pediatrics BIT NULL,
	physicalmedicine BIT NULL,
	rehabilitation BIT NULL,
	preventivemedicine BIT NULL,
	psychiatry BIT NULL,
	radiationoncology BIT NULL,
	surgery BIT NULL,
	urology BIT NULL
);

CREATE TABLE doctorReviews (
    id int NOT NULL IDENTITY,
	PRIMARY KEY (id),
	patientname varchar(255) NULL,
	pid int NULL,
	doctorname varchar(255) NULL,
	did int NULL,
	rating int NULL,
	reviewmessage varchar(max) NULL,
	rewviewcompleted BIT NULL
);

CREATE TABLE doctorDetails (
    id int NOT NULL,
	PRIMARY KEY (id),
	practicename varchar(255) NULL,
	address1 varchar(255) NULL,
	address2 varchar(255) NULL,
	city varchar(50) NULL,
	state1 varchar(15) NULL,
	zipcode varchar(15) NULL,
	npinumber varchar(10) NULL,
	specializations int NULL,
	treatscovid BIT NULL,
	bedstaken int NULL,
	bedsmax int NULL,
	lat float NULL,
	lng float NULL
);

CREATE TABLE doctorUsers (
    id int NOT NULL IDENTITY,
	PRIMARY KEY (id),
    email varchar(255) NULL,
	pword varchar(1024) NULL,
	fname varchar(255) NULL,
	lname varchar(255) NULL,
	phonenumber varchar(50) NULL,
	goauth varchar(50) NULL
);