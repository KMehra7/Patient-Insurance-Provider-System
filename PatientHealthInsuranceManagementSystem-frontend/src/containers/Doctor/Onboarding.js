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

import {onboardDoctor} from '../../store/actions/doctors';

class Onboarding extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      medical: {
        practicename: '',
        address1: '',
        address2: '',
        city: '',
        state1: '',
        zipcode: '',
        npinumber: '',
        specializations: '',
        treatscovid: '',
        bedstaken: 0,
        bedsmax: ''
      },
      specializationArray: []
    };
  }

  async componentDidMount() {
    const t = new Date();
    this.setState({
      ...this.state,
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

  onboardDoctor = async () => {
    this.setState({...this.state, loaded: false});
    let specializations = {
      allergy:false,
      immunology:false,
      anesthesiology:false,
      dermatology:false,
      diagnosticradiology:false,
      emergencymedicine:false,
      familymedicine:false,
      internalmedicine:false,
      medicalgenetics:false,
      neurology:false,
      nuclearmedicine:false,
      obstetrics:false,
      gynecology:false,
      ophthalmology:false,
      pathology:false,
      pediatrics:false,
      physicalmedicine:false,
      rehabilitation:false,
      preventivemedicine:false,
      psychiatry:false,
      radiationoncology:false,
      surgery:false,
      urology:false,
    };
    for await (const sp of this.state.specializationArray) {
      specializations[sp] = true;
    }
    const resp = await this.props.onboardDoctor({...this.state.medical, id: this.props.user.id, specializations: specializations});
    if(!resp.complete) { 
      this.props.addToast(resp.error, { appearance: 'error', autoDismiss: true });
    } else {
      this.props.addToast("Successfully onboarded!", { appearance: 'success', autoDismiss: true });
    }
    this.setState({...this.state, loaded: true});
  }

  render() {
    const {maxWidth, small, xs, theme, dark, user} = this.props;
    const {loaded, medical, specializationArray} = this.state;

    const medicalEmptyCheck = !empty(medical.address1) && !empty(medical.city) && !empty(medical.state1) && !empty(medical.zipcode) && !empty(medical.npinumber) && !empty(specializationArray);
    
    return (
      <Fragment>
        {!loaded && (<Loading />)}
        <Modal open style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
          <div style={{backgroundColor: "#fff", width: `calc(${maxWidth} - 4rem)`, padding: small ? "1rem" : "2rem", position: "relative", maxHeight: "80vh", overflowY: "scroll", borderRadius: 6, display: "flex", flexWrap: "wrap"}}>
            <Grid item container xs={12} direction="row" justify="center" style={{backgroundColor: theme.background.main}}>
              <Grid item container direction="column" style={{width: maxWidth, height: "100%", position: "relative"}}>
                <div style={{width: "100%", display: "flex", justifyContent: "space-between", alignItems: 'center'}}>
                  <span style={{marginBottom: "0.5rem", color: "#002868", fontSize: "2rem", fontWeight: 500}}>Practice Onboarding</span>
                </div>
                <Divider style={{marginBottom: "1rem", width: "100%"}}/>
                <Grid item container xs={12} style={{marginBottom: "2rem"}}>
                  <Grid container item xs={12} sm={6} direction="column" style={{paddingRight: xs ? "" : "0.5rem"}}>
                    <div style={{width: "100%", display: "flex", flexWrap: "wrap"}}>
                      <Grid container item xs={12} md={7} style={{marginBottom: "0.5rem"}}>
                        <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Practice Name</span>
                        <TextField
                          fullWidth
                          type="text"
                          name="practicename"
                          variant="outlined"
                          inputProps={{
                            placeholder: "Apollocare Medical"
                          }}
                          size="small"
                          onChange={this.handleMedicalChange}
                          value={medical.practicename}
                        />
                      </Grid>
                      <Grid container item xs={12} md={5} style={{paddingLeft: small ? "" : "0.5rem", marginBottom: "0.5rem"}}>
                        <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>NPI Number</span>
                        <TextField
                          fullWidth
                          type="text"
                          name="npinumber"
                          variant="outlined"
                          inputProps={{
                            placeholder: "1234567890",
                            maxLength: "10"
                          }}
                          size="small"
                          onChange={this.handleMedicalChange}
                          value={medical.npinumber}
                        />
                      </Grid>
                      <Grid container item xs={12} sm={5}>
                        <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Do you treat COVID-19?</span>
                        <RadioGroup style={{width: "100%"}} row value={medical.treatscovid} onChange={e => { this.setState({...this.state, medical: {...medical, treatscovid: JSON.parse(e.target.value), bedsmax: ''}})}}>
                          <FormControlLabel value={true} control={<Radio color="primary"/>} label="Yes" />
                          <FormControlLabel value={false} control={<Radio color="primary"/>} label="No" />
                        </RadioGroup>
                      </Grid>
                      {medical.treatscovid && (<Grid container item xs={12} sm={7}>
                        <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>How many COVID-19 beds do you have?</span>
                        <TextField
                          fullWidth
                          type="number"
                          name="bedsmax"
                          variant="outlined"
                          inputProps={{
                            placeholder: "20"
                          }}
                          min={medical.bedstaken}
                          size="small"
                          onChange={e => this.setState({...this.state, medical: {...medical, bedsmax: Number(e.target.value)}})}
                          value={medical.bedsmax}
                        />
                      </Grid>)}
                    </div>
                  </Grid>
                  <Grid container item xs={12} sm={6} direction="column" style={{paddingLeft: xs ? "" : "0.5rem", marginTop: xs ? "1rem" : ""}}>
                    <AddressInput data={medical} small={small} onChange={this.handleMedicalChange}/>
                  </Grid>
                  <Grid container item xs={12} direction="column" style={{marginTop: "0.5rem"}}>
                    <span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Specializations</span>
                    <Select
                      fullWidth
                      multiple
                      name="specializationArray"
                      value={specializationArray}
                      onChange={e => { e.preventDefault(); this.setState({...this.state, [e.target.name]: e.target.value}); }}
                      input={<OutlinedInput
                        size="small"
                        margin="dense"
                        placeholder="Dermatology, Anesthesiology, etc."
                      />}
                    >
                      {specializationOptions.map((option, i) =>
                        <MenuItem key={i} value={option.value}>
                          {option.label}
                        </MenuItem>
                      )}
                    </Select>
                  </Grid>
                  <Grid container item xs={12} alignItems="flex-end" justify="flex-end" style={{marginTop: "1rem"}}>
                    <Button onClick={this.onboardDoctor} variant="contained" color="primary" fullWidth={xs} disabled={!medicalEmptyCheck}>Save</Button>
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

export default connect(mapStateToProps,{onboardDoctor})(withRouter(withToast(Onboarding)));
