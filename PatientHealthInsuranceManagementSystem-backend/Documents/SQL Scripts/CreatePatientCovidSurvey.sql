CREATE TABLE patientCovidSurvey (
    id INT PRIMARY KEY,
	surveydate DATE NULL,
	feverorchills bit NULL,
	cough bit NULL,
	shortnessofbreathe bit NULL,
	fatigue bit NULL,
	muscleaches bit NULL,
	headache bit NULL,
	lossofsmelltaste bit NULL,
	sorethroat bit NULL,
	congestion bit NULL,
	nauseaorvomiting bit NULL,
	diarrhea bit NULL,
    contactwithcovidperson bit NULL,
	covidpositivetest bit NULL,
	selfmonitor bit NULL,
	requesttest bit NULL
);