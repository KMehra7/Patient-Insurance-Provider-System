CREATE TABLE insuranceDetails (
    id int NOT NULL,
	PRIMARY KEY (id),
	companyname varchar(255) NULL,
	address1 varchar(255) NULL,
	address2 varchar(255) NULL,
	city varchar(255) NULL,
	state1 varchar(15) NULL,
	zipcode varchar(15) NULL,
	lat float NULL,
	lng float NULL
); 

CREATE TABLE insuranceUsers (
    id int NOT NULL IDENTITY,
	PRIMARY KEY (id),
    email varchar(255) NULL,
	pword varchar(1024) NULL,
	fname varchar(255) NULL,
	lname varchar(255) NULL,
	phonenumber varchar(50) NULL,
	goauth varchar(50) NULL
); 

CREATE TABLE insurancePlans (
	planid int NOT NULL IDENTITY,
	PRIMARY KEY (planid),
	id int NULL,
	planname varchar(255) NULL,
	policynumber varchar(255) NULL,
	premium varchar(255) NULL,
	deductible varchar(255) NULL,
	benefitspdf varchar(1024) NULL,  
	includesmedical bit NULL,
	includesdental bit NULL,
	includesvision bit NULL
);
