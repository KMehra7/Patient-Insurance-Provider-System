import {SET_USER, UPDATE_USER} from '../types';

const user = (state = {}, action) => {
	switch(action.type) {
		case SET_USER:
			return action.payload;
		case UPDATE_USER:
			return {...state, ...action.payload};
		default:
			return state;
	}
}

export default user;