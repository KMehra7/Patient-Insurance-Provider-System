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

import {onboardInsurance} from '../../store/actions/insurance';

import {logoutUser} from '../../store/actions/user';

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      medical: {
        companyname: '',
        address1: '',
        address2: '',
        city: '',
        state1: '',
        zipcode: ''
      },
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

  handleMedicalChange = e => {
    this.setState({
      ...this.state,
      medical: {
        ...this.state.medical,
        [e.target.name]: e.target.value
      }
    })
  }

  onboardInsurance = async () => {
    this.setState({...this.state, loaded: false});
    const resp = await this.props.onboardInsurance({...this.state.medical, id: this.props.user.id});
    if(!resp.complete) { 
      this.props.addToast(resp.error, { appearance: 'error', autoDismiss: true });
    } else {
      this.props.addToast("Successfully onboarded!", { appearance: 'success', autoDismiss: true });
    }
    this.setState({...this.state, loaded: true});
  }

  render() {
    const {maxWidth, small, xs, theme, dark, user} = this.props;
    const {loaded, medical, basic, updateImg, time, password, specializationArray} = this.state;

    const medicalEmptyCheck = !empty(medical.address1) && !empty(medical.city) && !empty(medical.state1) && !empty(medical.zipcode) && !empty(medical.companyname);
    
    return (
      <Fragment>
        {!loaded && (<Loading />)}
        <Modal open style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
          <div style={{backgroundColor: "#fff", width: `calc(${maxWidth} - 4rem)`, padding: small ? "1rem" : "2rem", position: "relative", maxHeight: "80vh", overflowY: "scroll", borderRadius: 6, display: "flex", flexWrap: "wrap"}}>
            <Grid item container xs={12} direction="row" justify="center" style={{backgroundColor: theme.background.main}}>
              <Grid item container direction="column" style={{width: maxWidth, height: "100%", position: "relative"}}>
                <div style={{width: "100%", display: "flex", justifyContent: "space-between", alignItems: 'center'}}>
                  <span style={{marginBottom: "0.5rem", color: "#002868", fontSize: "2rem", fontWeight: 500}}>Company Onboarding</span>
                </div>
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
                    <Button onClick={this.onboardInsurance} variant="contained" color="primary" fullWidth={xs} disabled={!medicalEmptyCheck}>Save</Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </Modal>
      </Fragment>
    )
  }
}

const mapStateToProps = state => ({
  dark: state.dark,
  user: state.user
});

export default connect(mapStateToProps,{onboardInsurance})(withRouter(withToast(Account)));
