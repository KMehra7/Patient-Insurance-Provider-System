import {GET_APPOINTMENTS, UPDATE_APPOINTMENTS} from '../types';

const appointments = (state = [], action) => {
	switch(action.type) {
		case GET_APPOINTMENTS:
			return [...action.payload];
		case UPDATE_APPOINTMENTS:
			return [...state, action.payload]
		default:
			return state;
	}
}

export default appointments;