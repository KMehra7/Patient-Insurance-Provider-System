import empty from 'is-empty';

export const states = ['', 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY' ];
export const bloodtypes = ['', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+', "Unknown"];

export const bookTimes = [
	{
		starttime: 540,
		endtime: 570
	},
	{
		starttime: 570,
		endtime: 600
	},
	{
		starttime: 600,
		endtime: 630
	},
	{
		starttime: 630,
		endtime: 660
	},
	{
		starttime: 660,
		endtime: 690
	},
	{
		starttime: 690,
		endtime: 720
	},
	{
		starttime: 720,
		endtime: 750
	},
	{
		starttime: 750,
		endtime: 780
	},
	{
		starttime: 780,
		endtime: 810
	},
	{
		starttime: 810,
		endtime: 840
	},
	{
		starttime: 840,
		endtime: 870
	},
	{
		starttime: 870,
		endtime: 900
	},
	{
		starttime: 900,
		endtime: 930
	},
	{
		starttime: 930,
		endtime: 960
	},
	{
		starttime: 960,
		endtime: 990
	},
	{
		starttime: 990,
		endtime: 1020
	}
];

export const replaceTime = array => {
	return bookTimes.map(time => empty(array.filter(item => item.starttime === time.starttime)) ? time : array.filter(item => item.starttime === time.starttime)[0] );
}

export const specializationOptions = [
	{
		label: 'Allergy',
		value: 'allergy'
	},
	{
		label: 'Immunology',
		value: 'immunology'
	},
	{
		label: 'Anesthesiology',
		value: 'anesthesiology'
	},
	{
		label: 'Dermatology',
		value: 'dermatology'
	},
	{
		label: 'Diagnostic Radiology',
		value: 'diagnosticradiology'
	},
	{
		label: 'Emergency Medicine',
		value: 'emergencymedicine'
	},
	{
		label: 'Family Medicine',
		value: 'familymedicine'
	},
	{
		label: 'Internal Medicine',
		value: 'internalmedicine'
	},
	{
		label: 'Medical Genetics',
		value: 'medicalgenetics'
	},
	{
		label: 'Neurology',
		value: 'neurology'
	},
	{
		label: 'Nuclear Medicine',
		value: 'nuclearmedicine'
	},
	{
		label: 'Obstetrics',
		value: 'obstetrics'
	},
	{
		label: 'Gynecology',
		value: 'gynecology'
	},
	{
		label: 'Ophthalmology',
		value: 'ophthalmology'
	},
	{
		label: 'Pathology',
		value: 'pathology'
	},
	{
		label: 'Pediatrics',
		value: 'pediatrics'
	},
	{
		label: 'Physical Medicine',
		value: 'physicalmedicine'
	},
	{
		label: 'Rehabilitation',
		value: 'rehabilitation'
	},
	{
		label: 'Preventive Medicine',
		value: 'preventivemedicine'
	},
	{
		label: 'Rehabilitation',
		value: 'rehabilitation'
	},
	{
		label: 'Psychiatry',
		value: 'psychiatry'
	},
	{
		label: 'Radiationoncology',
		value: 'radiationoncology'
	},
	{
		label: 'Surgery',
		value: 'surgery'
	},
	{
		label: 'Urology',
		value: 'urology'
	}
];

export const getSpecializations = arr => {
	return arr.map(item => specializationOptions.filter(option => option.value === item)[0].label);
}



