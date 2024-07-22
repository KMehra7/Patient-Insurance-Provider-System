import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from "react-redux";
import withToast from '../../utils/withToast';
import moment from 'moment';
import empty from 'is-empty';

import {TextField, Grid, MenuItem, Button, Divider, InputAdornment, Modal, Select, RadioGroup, Radio, FormControlLabel} from '@material-ui/core';

import Loading from '../../components/Graphics/Loading';
import AddressInput from '../../components/Inputs/AddressInput';
import HeightInput from '../../components/Inputs/HeightInput';
import DateInput from '../../components/Inputs/DateInput';

import {bloodtypes} from '../../utils/options';

import {onboardPatient} from '../../store/actions/patients';

class Onboarding extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      data: {
        address1: '',
        address2: '',
        city: '',
        state1: '',
        zipcode: '',
        birthdate: '',
        sex: '',
        height: '',
        weight1: '',
        bloodtype: '',
        smoke: '',
        smokefreq: 0,
        drink: '',
        drinkfreq: 0,
        caffeine: '',
        caffeinefreq: 0
      }
    };
  }

  handleDataChange = e => {
    this.setState({
      ...this.state,
      data: {
        ...this.state.data,
        [e.target.name]: e.target.value
      }
    })
  }

  onboardPatient = async () => {
    this.setState({...this.state, loaded: false});

     this.state.data.height = this.state.data.height.replaceAll('_', '');
    // this.state.data.birthdate = this.state.data.birthdate.replaceAll('_', '');

    const resp = await this.props.onboardPatient({...this.state.data, id: this.props.user.id});
    if(!resp.complete) {
      this.props.addToast(resp.error, { appearance: 'error', autoDismiss: true });
    } else {
      this.props.addToast("Successfully onboarded!", { appearance: 'success', autoDismiss: true });
    }
    this.setState({...this.state, loaded: true});
  }

  render() {
    const {maxWidth, small, xs, theme, dark} = this.props;
    const {loaded, data} = this.state;

    const emptyCheck = !empty(data.address1) && !empty(data.state1) && !empty(data.zipcode) && !empty(data.birthdate) && !empty(data.sex) && !empty(data.height) && !empty(data.weight1) && !empty(data.bloodtype) && !empty(data.smoke) && (data.smoke ? !empty(data.smokefreq) : true) && !empty(data.drink) && (data.drink ? !empty(data.drinkfreq) : true) && !empty(data.caffeine) && (data.caffeine ? !empty(data.caffeinefreq) : true);

    return (
      <Modal open style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
        <div style={{backgroundColor: "#fff", width: `calc(${maxWidth} - 4rem)`, padding: small ? "1rem" : "2rem", position: "relative", maxHeight: "80vh", overflowY: "scroll", borderRadius: 6, display: "flex", flexWrap: "wrap"}}>
          <span style={{marginBottom: "0.5rem", color: "#002868", fontSize: "2rem", fontWeight: 500, width: "100%"}}>Patient Onboarding</span>
          <Divider style={{marginBottom: "1rem", width: "100%"}}/>
          <Grid container item xs={12} sm={6} direction="column" style={{paddingRight: xs ? "" : "0.5rem"}}>
            <span style={{width: "100%", fontSize: "1.1rem", fontWeight: 400, marginBottom: "0.5rem"}}>Home Address</span>
            <Divider style={{marginBottom: "0.75rem", width: "100%"}}/>
            <AddressInput data={data} small={small} onChange={this.handleDataChange}/>
          </Grid>
          <Grid container item xs={12} sm={6} direction="column" style={{paddingLeft: xs ? "" : "0.5rem", marginTop: xs ? "1rem" : ""}}>
            <span style={{width: "100%", fontSize: "1.1rem", fontWeight: 400, marginBottom: "0.5rem"}}>Personal Information</span>
            <Divider style={{marginBottom: "0.75rem", width: "100%"}}/>
            <div style={{width: "100%", display: "flex", flexWrap: "wrap"}}>
              <Grid container item xs={12} md={4} style={{marginBottom: small ? "0.5rem" : ""}}>
                <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Sex</span>
                <Select
                  native
                  fullWidth
                  name="sex"
                  placeholder="Sex"
                  variant="outlined"
                  value={data.sex}
                  size="small"
                  margin="dense"
                  onChange={this.handleDataChange}
                >
                  {['', 'Male', 'Female'].map((x, i) =>
                    <option key={i} value={x}>{x}</option>
                  )}
                </Select>
              </Grid>
              <Grid container item xs={6} md={4} style={{paddingRight: "0.5rem", paddingLeft: small ? "" : "0.5rem"}}>
                <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Height</span>
                <HeightInput value={data.height} onChange={this.handleDataChange} name="height"/>
              </Grid>
              <Grid container item xs={6} md={4}>
                <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Weight</span>
                <TextField
                  fullWidth
                  type="text"
                  name="weight1"
                  variant="outlined"
                  inputProps={{
                    placeholder: "150"
                  }}
                  size="small"
                  onChange={this.handleDataChange}
                  value={data.weight1}
                />
              </Grid>
              <Grid container item xs={6} style={{marginTop: "0.5rem"}}>
                <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Birth Date</span>
                <DateInput name="birthdate" value={data.birthdate} onChange={this.handleDataChange}/>
              </Grid>
              <Grid container item xs={6} style={{marginTop: "0.5rem", paddingLeft: "0.5rem"}}>
                <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Blood Type</span>
                <Select
                  native
                  fullWidth
                  name="bloodtype"
                  placeholder="Blood Type"
                  variant="outlined"
                  value={data.bloodtype}
                  size="small"
                  margin="dense"
                  onChange={this.handleDataChange}
                >
                  {bloodtypes.map((x, i) =>
                    <option key={i} value={x}>{x}</option>
                  )}
                </Select>
              </Grid>
            </div>
          </Grid>
          <Grid container item xs={12} sm={6} direction="column" style={{marginTop: "1rem"}}>
            <span style={{width: "100%", fontSize: "1.1rem", fontWeight: 400, marginBottom: "0.5rem"}}>Behaviors</span>
            <Divider style={{marginBottom: "0.75rem", width: "100%"}}/>
            <div style={{width: "100%", display: "flex", flexWrap: "wrap"}}>
              <Grid container item xs={12} style={{marginBottom: "0.5rem"}}>
                <Grid container item xs={12} sm={6} direction="column">
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Do you smoke?</span>
                  <RadioGroup row value={data.smoke} onChange={e => { this.setState({...this.state, data: {...data, smoke: JSON.parse(e.target.value), smokefreq: 0}})}}>
                    <FormControlLabel value={true} control={<Radio color="primary"/>} label="Yes" />
                    <FormControlLabel value={false} control={<Radio color="primary"/>} label="No" />
                  </RadioGroup>
                </Grid>
                {data.smoke && (<Grid container item xs={12} sm={6} direction="column" style={{marginBottom: "1rem"}}>
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>How many times per week?</span>
                  <TextField
                    fullWidth
                    type="number"
                    name="smokefreq"
                    variant="outlined"
                    inputProps={{
                      placeholder: "#"
                    }}
                    size="small"
                    onChange={this.handleDataChange}
                    value={data.smokefreq}
                  />
                </Grid>)}
              </Grid>
              <Grid container item xs={12} style={{marginBottom: "0.5rem"}}>
                <Grid container item xs={12} sm={6} direction="column">
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Do you drink alcohol?</span>
                  <RadioGroup row value={data.drink} onChange={e => { this.setState({...this.state, data: {...data, drink: JSON.parse(e.target.value), drinkfreq: 0}})}}>
                    <FormControlLabel value={true} control={<Radio color="primary"/>} label="Yes" />
                    <FormControlLabel value={false} control={<Radio color="primary"/>} label="No" />
                  </RadioGroup>
                </Grid>
                {data.drink && (<Grid container item xs={12} sm={6} direction="column" style={{marginBottom: "1rem"}}>
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>How many times per week?</span>
                  <TextField
                    fullWidth
                    type="number"
                    name="drinkfreq"
                    variant="outlined"
                    inputProps={{
                      placeholder: "#"
                    }}
                    size="small"
                    onChange={this.handleDataChange}
                    value={data.drinkfreq}
                  />
                </Grid>)}
              </Grid>
              <Grid container item xs={12}>
                <Grid container item xs={12} sm={6} direction="column">
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Do you drink caffeine?</span>
                  <RadioGroup row value={data.caffeine} onChange={e => { this.setState({...this.state, data: {...data, caffeine: JSON.parse(e.target.value), caffeinefreq: 0}})}}>
                    <FormControlLabel value={true} control={<Radio color="primary"/>} label="Yes" />
                    <FormControlLabel value={false} control={<Radio color="primary"/>} label="No" />
                  </RadioGroup>
                </Grid>
                {data.caffeine && (<Grid container item xs={12} sm={6} direction="column">
                  <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>How many times per week?</span>
                  <TextField
                    fullWidth
                    type="number"
                    name="caffeinefreq"
                    variant="outlined"
                    inputProps={{
                      placeholder: "#"
                    }}
                    size="small"
                    onChange={this.handleDataChange}
                    value={data.caffeinefreq}
                  />
                </Grid>)}
              </Grid>
            </div>
          </Grid>
          <Grid container item xs={12} sm={6} alignItems="flex-end" justify="flex-end" style={{marginTop: "1rem"}}>
            <Button onClick={this.onboardPatient} variant="contained" color="primary" fullWidth={xs} disabled={!emptyCheck}>Continue</Button>
          </Grid>
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({
  dark: state.dark,
  user: state.user
});

export default connect(mapStateToProps,{onboardPatient})(withRouter(withToast(Onboarding)));
