const base = 'https://apollocare.blob.core.windows.net/static';

export const logo = base + '/logo.png';
export const darklogo = base + '/darklogo.png';
export const rocket = base + '/rocket.png';
export const patient = base + '/patient.jpg';
export const doctor = base + '/doctor.jpeg';
export const insurance = base + '/insurance.jpg';

export const get_role_img = role => {
	return role === "patient" ? patient : role === "doctor" ? doctor : insurance;
}