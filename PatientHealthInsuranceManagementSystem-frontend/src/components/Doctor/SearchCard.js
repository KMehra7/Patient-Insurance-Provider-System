import React, {Component, Fragment} from 'react';
import {Link} from 'react-router-dom';
import moment from 'moment';
import empty from 'is-empty';

import {TextField, Grid, MenuItem, Button, Divider} from '@material-ui/core';
import {CheckCircle, Cancel} from '@material-ui/icons';

import Stars from '../Graphics/Stars';

import {getSpecializations} from '../../utils/options';

class SearchCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const {small, xs, theme, doctor, i} = this.props;

    let arr = [];
    for(let key in this.props.doctor.specializations) {
      if(this.props.doctor.specializations[key] === true) arr.push(key);
    }
    
    return (
      <Grid id={`${i + 1}`} container item xs={12} sm={6} md={7} style={{padding: "1rem", border: "1px solid #ddd", marginBottom: "1px", position: "relative", paddingRight: "0.5rem"}}>
        {!xs && (<span style={{position: "absolute", right: 3, top: 3, color: "#ccc", fontSize: "0.8rem"}}>{i + 1}</span>)}
        <Grid container item xs={4} md={3}>
          <div style={{width: "100%", maxHeight: "10rem", overflow: "hidden", borderRadius: 3}}>
            <img src={`https://apollocare.blob.core.windows.net/doctor${doctor.id}/profile`} alt="" style={{width: "100%", objectFit: "cover", borderRadius: 3}}/>
          </div>
        </Grid>
        <Grid container item xs={8} md={5} direction="column" style={{paddingLeft: "1rem"}}>
          <span style={{fontSize: "1.5rem", fontWeight: 500}}>{doctor.fname} {doctor.lname}</span>
          <Stars rating={3.5} number={100} style={{marginTop: "0.5rem"}}/>
          <span style={{fontSize: "1rem", fontWeight: 400, marginTop: "0.5rem"}}>{doctor.detail.practicename}</span>
          <span style={{fontSize: "1rem", fontWeight: 300, marginTop: "0.25rem"}}>{doctor.detail.address1}{empty(doctor.detail.address2) ? '' : `, ${doctor.detail.address2}`}</span>
          <span style={{fontSize: "1rem", fontWeight: 300, marginTop: "0.25rem"}}>{doctor.detail.city}, {doctor.detail.state1} {doctor.detail.zipcode}</span>
        </Grid>
        {!small && (<Grid container item direction="column" justify="space-between" xs={4} style={{paddingLeft: "1rem"}}>
          <div style={{display: "flex", flexDirection: "column"}}>
            <span style={{fontSize: "0.9rem", fontWeight: 300, display: "flex", alignItems: "center"}}>{doctor.detail.treatscovid ? <CheckCircle style={{fontSize: "1rem", color: "green", marginRight: "0.25rem"}}/> : <Cancel style={{fontSize: "1rem", color: "red", marginRight: "0.25rem"}}/>} COVID-19 care</span>
            <ul style={{paddingInlineStart: "1.5rem", marginBlockStart: "0.5rem"}}>{getSpecializations(arr).map(item => <li style={{fontWeight: 300, fontSize: "0.9rem"}}>{item}</li>)}</ul>
          </div>
          <Link to={`/patient/find/${doctor.id}`} style={{marginTop: "1rem"}}><Button variant="contained" color="secondary">BOOK ONLINE</Button></Link>
        </Grid>)}
      </Grid>
    )
  }
}

export default SearchCard;
