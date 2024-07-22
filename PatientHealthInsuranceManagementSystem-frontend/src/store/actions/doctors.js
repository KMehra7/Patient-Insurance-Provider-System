import {apiCall} from "../../services/api";
import jwt_decode from "jwt-decode";

import {UPDATE_USER} from "../types";

export const state_update_user = payload => ({
  type: UPDATE_USER,
  payload
});

// Update Patient User Info
export const updateBasic = data => dispatch => {
  return apiCall('put', `/api/doctors/user`, data)
  .then(function(res) {
    dispatch(state_update_user(res));
    return {complete: true};
  })
  .catch(function(err) {
    return {complete: false, error: err.data.error};
  });
};

// Register Patient Medical Data
export const onboardDoctor = data => dispatch => {
  return apiCall('post', `/api/doctors/onboard`, data)
  .then(function(res) {
    dispatch(state_update_user(res));
    return {complete: true};
  })
  .catch(function(err) {
    return {complete: false, error: err.data.error};
  });
};

// Update Patient Medical Data
export const updateMedical = data => dispatch => {
  return apiCall('put', `/api/doctors/details`, data)
  .then(function(res) {
    dispatch(state_update_user(res));
    return {complete: true};
  })
  .catch(function(err) {
    return {complete: false, error: err.data.error};
  });
};

// Update Patient Profile Picture
export const updateProfilePic = data => {
  return apiCall('put', `/api/doctors/profilepic`, data)
  .then(function(res) {
    return {complete: true};
  })
  .catch(function(err) {
    return {complete: false, error: err.data.error};
  });
};

// Update Patient Password
export const updatePassword = data => {
  return apiCall('put', `/api/doctors/password`, data)
  .then(function(res) {
    return {complete: true};
  })
  .catch(function(err) {
    return {complete: false, error: err.data.error};
  });
};