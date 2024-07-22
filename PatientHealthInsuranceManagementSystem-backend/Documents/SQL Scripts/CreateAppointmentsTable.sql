CREATE TABLE appointments (
    did INT NOT NULL,
	pid INT NOT NULL,
    appointmentdate DATE NOT NULL,
    starttime int NOT NULL,
    endtime int NOT NULL,
    
	PRIMARY KEY (did, appointmentdate, startTime),
    
	CONSTRAINT mustStartOnThirtyMinuteBoundary CHECK (
        starttime % 30 = 0
    ),
    CONSTRAINT mustEndOnThirtyMinuteBoundary CHECK (
        endtime % 30 = 0
    ),
    CONSTRAINT cannotStartBefore0900 CHECK (
        starttime >= 540
    ),
    CONSTRAINT cannotEndAfter1700 CHECK (
        starttime < 1020
    ),
    CONSTRAINT mustEndAfterStart CHECK (
        endtime > starttime
    )
);