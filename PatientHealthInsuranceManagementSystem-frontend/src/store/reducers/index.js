import {combineReducers} from 'redux';
import dark from "./dark";
import user from "./user";
import doctors from "./doctors";
import appointments from "./appointments";

const rootReducer = combineReducers({
	dark,
	user,
	doctors,
	appointments
});

export default rootReducer;