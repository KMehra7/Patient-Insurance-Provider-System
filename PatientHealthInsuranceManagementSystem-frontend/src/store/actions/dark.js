import {SET_DARK} from '../types';
import empty from 'is-empty';

export const state_set_dark = payload => ({
	type: SET_DARK,
	payload
});