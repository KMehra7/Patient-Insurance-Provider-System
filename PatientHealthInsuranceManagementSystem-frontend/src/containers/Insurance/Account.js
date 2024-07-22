import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from "react-redux";
import withToast from '../../utils/withToast';
import moment from 'moment';
import empty from 'is-empty';

import {TextField, Grid, MenuItem, Button, Divider, InputAdornment, Modal, Select, RadioGroup, Radio, FormControlLabel, Input, OutlinedInput} from '@material-ui/core';

import Loading from '../../components/Graphics/Loading';
import AddressInput from '../../components/Inputs/AddressInput';
import HeightInput from '../../components/Inputs/HeightInput';
import DateInput from '../../components/Inputs/DateInput';
import PhoneInput from '../../components/Inputs/PhoneInput';

import {bloodtypes, specializationOptions} from '../../utils/options';

import {updateBasic, updatePassword, updateMedical, updateProfilePic} from '../../store/actions/insurance';

import {logoutUser} from '../../store/actions/user';

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      basic: {
        fname: '',
        lname: '',
        email: '',
        phonenumber: '',
        img: ''
      },
      password: {
        pwordold: '',
        pword: '',
        pwordconfirmation: ''
      },
      medical: {
        companyname: '',
        address1: '',
        address2: '',
        city: '',
        state1: '',
        zipcode: ''
      },
      updateImg: false,
      time: 0
    };
  }

  async componentDidMount() {
    const t = new Date();
    this.setState({
      ...this.state, 
      medical: empty(this.props.user.detail) ? this.state.medical : this.props.user.detail,
      basic: this.props.user,
      time: t.getMilliseconds(),
      loaded: true
    });
  }

  onImageUpload = e => {
    e.preventDefault();
    if(!empty(e.target.files)) {
      this.setState({...this.state, loaded: false});
      this.imgChange(e, this.setImgState);
    }
    
  }

  imgChange = (e, cb) => {
    var reader = new FileReader();
    reader.onload = function() { cb(reader.result) };
    reader.readAsDataURL(e.target.files[0]);
  }

  setImgState = async blob => {
    const resp = await updateProfilePic({img: blob, id: this.props.user.id});
    if(resp.complete) {
      this.setState({
        ...this.state,
        basic: {
          ...this.state.basic,
          img: blob
        },
        updateImg: false,
        loaded: true
      });
    } else {
      this.props.addToast(resp.error, {appearance: "error", autoDismiss: true});
      this.setState({...this.state, loaded: true});
    }
  }

  handleBasicChange = e => {
    this.setState({
      ...this.state,
      basic: {
        ...this.state.basic,
        [e.target.name]: e.target.value
      }
    })
  } 

  handlePasswordChange = e => {
    this.setState({
      ...this.state,
      password: {
        ...this.state.password,
        [e.target.name]: e.target.value
      }
    })
  } 

  handleMedicalChange = e => {
    this.setState({
      ...this.state,
      medical: {
        ...this.state.medical,
        [e.target.name]: e.target.value
      }
    })
  }

  updateBasic = async () => {
    this.setState({...this.state, loaded: false});
    const resp = await this.props.updateBasic({...this.state.basic, id: this.props.user.id});
    if(!resp.complete) { 
      this.props.addToast(resp.error, { appearance: 'error', autoDismiss: true });
    } else {
      this.props.addToast("Successfully updated user information!", { appearance: 'success', autoDismiss: true });
    }
    this.setState({...this.state, loaded: true});
  }

  updatePassword = async () => {
    this.setState({...this.state, loaded: false});
    const resp = await updatePassword({...this.state.password, id: this.props.user.id});
    if(!resp.complete) { 
      this.setState({...this.state, loaded: true});
      this.props.addToast(resp.error, { appearance: 'error', autoDismiss: true });
    } else {
      this.setState({...this.state, loaded: true, password: {pword: '', pwordold: '', pwordconfirmation: ''}});
      this.props.addToast("Successfully updated password!", { appearance: 'success', autoDismiss: true });
    }
  }

  updateMedical = async () => {
    this.setState({...this.state, loaded: false});
    const resp = await this.props.updateMedical({...this.state.medical, id: this.props.user.id});
    if(!resp.complete) { 
      this.props.addToast(resp.error, { appearance: 'error', autoDismiss: true });
    } else {
      this.props.addToast("Successfully updated company data!", { appearance: 'success', autoDismiss: true });
    }
    this.setState({...this.state, loaded: true});
  }

  render() {
    const {maxWidth, small, xs, theme, dark, user} = this.props;
    const {loaded, medical, basic, updateImg, time, password, specializationArray} = this.state;

    const basicEmptyCheck = !empty(basic.fname) && !empty(basic.lname) && !empty(basic.email) && !empty(basic.phonenumber);
    const passwordEmptyCheck = !empty(password.pwordold) && !empty(password.pword) && !empty(password.pwordconfirmation);
    const medicalEmptyCheck = !empty(medical.address1) && !empty(medical.city) && !empty(medical.state1) && !empty(medical.zipcode) && !empty(medical.companyname);
    
    return (
      <Fragment>
        {!loaded && (<Loading />)}
        <Grid item container xs={12} direction="row" justify="center" style={{backgroundColor: theme.background.main, minHeight: "calc(100vh - 4rem)"}}>
          <Grid item container direction="column" style={{width: maxWidth, padding: small ? "2rem 1rem" : "3rem 0", height: "100%", position: "relative"}}>
            <div style={{width: "100%", display: "flex", justifyContent: "space-between", alignItems: 'center'}}>
              <span style={{marginBottom: "0.5rem", color: "#002868", fontSize: "2rem", fontWeight: 500}}>Account</span>
              <Button color="primary" variant="outlined" onClick={this.props.logoutUser}>Logout</Button>
            </div>
            <Divider style={{marginBottom: "1rem", width: "100%"}}/>
            <span style={{marginBottom: "0.5rem", color: "#002868", fontSize: "1.5rem", fontWeight: 400, width: "100%"}}>Basic Information</span>
            <Divider style={{marginBottom: "1rem", width: "100%"}}/>
            <Grid item container xs={12} style={{marginBottom: "2rem"}}>
              <Grid item container xs={12} sm={10}>
                <Grid item container direction="column" justify="space-between" xs={6} sm={4} md={3}>
                  <img src={empty(basic.img) ? `https://apollocare.blob.core.windows.net/insurance${user.id}/profile?time=${time}` : basic.img} alt="" style={{width: "5.5rem", height: "5.5rem", borderRadius: "50%", objectFit: "cover"}}/>
                  {updateImg && (<input type="file" accept="image/*" name="IMAGE" onChange={this.onImageUpload} style={{marginBottom: "0.5rem"}}/>)}
                  {!updateImg && (<Button onClick={() => this.setState({...this.state, updateImg: true})} size="small" variant="contained" color="primary" style={{marginBottom: "0.5rem"}}>UPDATE</Button>)}
                </Grid>
                <Grid item container direction="column" xs={6} sm={4} md={5} style={{paddingLeft: "0.5rem", paddingRight: !xs ? "0.5rem" : ""}}>
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>First Name</span>
                  <TextField
                    size="small"
                    variant="outlined"
                    value={basic.fname}
                    name="fname"
                    onChange={this.handleBasicChange}
                    color="primary"
                    inputProps={{
                      placeholder: "First Name"
                    }}
                    style={{marginBottom: "0.5rem"}}
                    fullWidth
                  />
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Last Name</span>
                  <TextField
                    size="small"
                    variant="outlined"
                    value={basic.lname}
                    name="lname"
                    onChange={this.handleBasicChange}
                    color="primary"
                    inputProps={{
                      placeholder: "Last Name"
                    }}
                    style={{marginBottom: "0.5rem"}}
                    fullWidth
                  />
                </Grid>
                <Grid item container direction="column" xs={12} sm={4} md={4}>
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Email</span>
                  <TextField
                    size="small"
                    variant="outlined"
                    value={basic.email}
                    name="email"
                    onChange={this.handleBasicChange}
                    color="primary"
                    inputProps={{
                      placeholder: "Email"
                    }}
                    style={{marginBottom: "0.5rem"}}
                    fullWidth
                    disabled={!empty(user.goauth)}
                  />
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Phone Number</span>
                  <PhoneInput
                    value={basic.phonenumber}
                    name="phonenumber"
                    onChange={value => this.setState({...this.state, basic: {...basic, phonenumber: value}})}
                    style={{marginBottom: "0.5rem"}}
                  />
                </Grid>
              </Grid>
              <Grid item container xs={12} sm={2} alignItems="flex-end" justify="flex-end">
                <Button onClick={this.updateBasic} variant="contained" color="primary" fullWidth={xs} disabled={!basicEmptyCheck}>Save</Button>
              </Grid>
            </Grid>
            <span style={{marginBottom: "0.5rem", color: "#002868", fontSize: "1.5rem", fontWeight: 400, width: "100%"}}>Company Information</span>
            <Divider style={{marginBottom: "1rem", width: "100%"}}/>
            <Grid item container xs={12} style={{marginBottom: "2rem"}}>
              <Grid container item xs={12} md={7} style={{marginBottom: "0.5rem"}}>
                <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Company Name</span>
                <TextField
                  fullWidth
                  type="text"
                  name="companyname"
                  variant="outlined"
                  inputProps={{
                    placeholder: "Apollocare Medical Insurance"
                  }}
                  size="small"
                  onChange={this.handleMedicalChange}
                  value={medical.companyname}
                />
              </Grid>
              <Grid container item xs={12} sm={7} direction="column">
                <AddressInput data={medical} small={small} onChange={this.handleMedicalChange}/>
              </Grid>
              <Grid container item xs={12} sm={5} alignItems="flex-end" justify="flex-end" style={{marginTop: "1rem"}}>
                <Button onClick={this.updateMedical} variant="contained" color="primary" fullWidth={xs} disabled={!medicalEmptyCheck}>Save</Button>
              </Grid>
            </Grid>
            {empty(user.goauth) && (<Fragment>
              <span style={{marginBottom: "0.5rem", color: "#002868", fontSize: "1.5rem", fontWeight: 400, width: "100%"}}>Password Reset</span>
              <Divider style={{marginBottom: "1rem", width: "100%"}}/>
              <Grid item container xs={12}>
                <Grid item container xs={12} sm={6} direction="column">
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Current Password</span>
                  <TextField
                    size="small"
                    variant="outlined"
                    value={password.pwordold}
                    name="pwordold"
                    onChange={this.handlePasswordChange}
                    color="primary"
                    type="password"
                    inputProps={{
                      placeholder: "Old Password"
                    }}
                    style={{marginBottom: "0.5rem"}}
                    fullWidth
                  />
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>New Password</span>
                  <TextField
                    size="small"
                    variant="outlined"
                    value={password.pword}
                    name="pword"
                    type="password"
                    onChange={this.handlePasswordChange}
                    color="primary"
                    inputProps={{
                      placeholder: "New Password"
                    }}
                    style={{marginBottom: "0.5rem"}}
                    fullWidth
                  />
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Confirm New Password</span>
                  <TextField
                    size="small"
                    variant="outlined"
                    value={password.pwordconfirmation}
                    name="pwordconfirmation"
                    type="password"
                    onChange={this.handlePasswordChange}
                    color="primary"
                    inputProps={{
                      placeholder: "Confirm New Password"
                    }}
                    style={{marginBottom: "0.5rem"}}
                    fullWidth
                  />
                </Grid>
                <Grid item container xs={12} sm={6} alignItems="flex-end" justify="flex-end">
                  <Button onClick={this.updatePassword} variant="contained" color="primary" fullWidth={xs} disabled={!passwordEmptyCheck}>UPDATE</Button>
                </Grid>
              </Grid>
            </Fragment>)}
          </Grid>
        </Grid>
      </Fragment>
    )
  }
}

const mapStateToProps = state => ({
  dark: state.dark,
  user: state.user
});

export default connect(mapStateToProps,{updateBasic, updateMedical, logoutUser})(withRouter(withToast(Account)));
