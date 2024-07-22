
CREATE TABLE insuranceProviderDetails (
    id int NOT NULL IDENTITY,
	PRIMARY KEY (id),
	companyname varchar(255) NULL,
	address1 varchar(255) NULL,
	address2 varchar(255) NULL,
	city varchar(255) NULL,
	state1 varchar(15) NULL,
	zipcode varchar(15) NULL,
); 

CREATE TABLE insuranceUsers (
    id int NOT NULL IDENTITY,
	PRIMARY KEY (id),
    email varchar(255) NOT NULL,
	pword varchar(1024) NOT NULL,
	fname varchar(255) NOT NULL,
	lname varchar(255) NOT NULL,
	phonenumber varchar(50) NOT NULL,
	profilepicid varchar(255) NOT NULL,
	insuranceproviderdetails int
    FOREIGN KEY (insuranceproviderdetails) REFERENCES [dbo].[insuranceProviderDetails](id)
); 

CREATE TABLE insurancePlans (
	id int NOT NULL IDENTITY,
	PRIMARY KEY (id),
	planname varchar(255) NULL,
	policynumber varchar(255) NULL,
	premium varchar(255) NULL,
	deductible varchar(255) NULL,
	benefitspdf varchar(1024) NULL,  
	insuranceusers int
	FOREIGN KEY (insuranceusers) REFERENCES [dbo].[insuranceUsers](id)
);

