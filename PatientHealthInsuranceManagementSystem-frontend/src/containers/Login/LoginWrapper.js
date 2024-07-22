import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import moment from 'moment';
import empty from 'is-empty';

import {patient, doctor, insurance} from '../../utils/images';

import {TextField, Grid, MenuItem, Paper, Divider, withWidth, InputAdornment} from '@material-ui/core';

import Loading from '../../components/Graphics/Loading';
import Login from '../../components/Login/Login';
import Register from '../../components/Login/Register';

const roles = ['patient', 'insurance', 'doctor'];

class LoginWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      role: !roles.includes(this.props.match.params?.role) ? '' : (this.props.match.params?.role || '')
    };
  }

  componentDidMount() {
    if(empty(this.props.user.iat) && !empty(this.props.user.id) && empty(this.props.user.hashedduocode)) {
      this.props.history.push(`/${this.props.user.usertype}/dashboard`)
    }
  }

  render() {
    const {maxWidth, small, xs, theme, dark, login} = this.props;
    const {role} = this.state;
    
    return (
      <Grid item container xs={12} justify="center" style={{backgroundColor: theme.background.main, minHeight: "calc(100vh - 4rem)"}}>
        {empty(role) && (<Grid item container direction="column" style={{width: maxWidth, height: "100%"}}>
          <span style={{fontSize: "1.4rem", fontWeight: 500, marginTop: "1.5rem", padding: small ? "0 1rem" : "", color: theme.primary.main}}>{login ? "Portal Sign In" : "Registration"}</span>
          <Grid item container justify="space-between" style={{width: "100%", padding: small ? "1rem" : "1rem 0", position: "relative"}}>
            <Link to={`/${login ? "login" : "register"}/patient`} style={{width: xs ? "calc(100vw - 2rem)" : "calc(33.33% - 1rem)", marginRight: xs ? "" : "1.5rem", marginBottom: xs ? "1rem" : ""}}>
              <Paper variant="outlined" style={{display: "flex", flexDirection: "column", padding: "1rem", background: theme.primary.contrastText, borderColor: theme.primary.main}}>
                <img src={patient} alt="" style={{width: "100%", height: "10rem", objectFit: "cover", borderRadius: 5}}/>
                <span style={{fontWeight: 500, color: theme.primary.main, fontSize: "1.4rem", marginTop: "0.5rem"}}>Patient</span>
                <span style={{color: theme.primary.main, marginTop: "0.3rem"}}>Search for doctors, choose an insurance provider, or get directions to your next appointment.</span>
              </Paper>
            </Link>
            <Link to={`/${login ? "login" : "register"}/doctor`} style={{width: xs ? "calc(100vw - 2rem)" : "calc(33.33% - 1rem)", marginRight: xs ? "" : "1.5rem", marginBottom: xs ? "1rem" : ""}}>
              <Paper variant="outlined" style={{display: "flex", flexDirection: "column", padding: "1rem", background: theme.primary.contrastText, borderColor: theme.primary.main}}>
                <img src={doctor} alt="" style={{width: "100%", height: "10rem", objectFit: "cover", borderRadius: 5}}/>
                <span style={{fontWeight: 500, color: theme.primary.main, fontSize: "1.4rem", marginTop: "0.5rem"}}>Doctor</span>
                <span style={{color: theme.primary.main, marginTop: "0.3rem"}}>Search for doctors, choose an insurance provider, or get directions to your next appointment.</span>
              </Paper>
            </Link>
            <Link to={`/${login ? "login" : "register"}/insurance`} style={{width: xs ? "calc(100vw - 2rem)" : "calc(33.33% - 1rem)"}}>
              <Paper variant="outlined" style={{display: "flex", flexDirection: "column", padding: "1rem", background: theme.primary.contrastText, borderColor: theme.primary.main}}>
                <img src={insurance} alt="" style={{width: "100%", height: "10rem", objectFit: "cover", borderRadius: 5}}/>
                <span style={{fontWeight: 500, color: theme.primary.main, fontSize: "1.4rem", marginTop: "0.5rem"}}>Insurance Provider</span>
                <span style={{color: theme.primary.main, marginTop: "0.3rem"}}>Search for doctors, choose an insurance provider, or get directions to your next appointment.</span>
              </Paper>
            </Link>
          </Grid>
        </Grid>)}
        {!empty(role) && (<Grid item container direction="column" justify="center" style={{width: maxWidth, height: "100%", padding: small ? "0 1rem 1rem" : "", marginTop: small ? "1rem" : "10vh"}}>
          {login ? <Login {...this.props} role={role}/> : <Register {...this.props} role={role}/>}
        </Grid>)}
      </Grid>
    )
  }
}

export default withRouter(LoginWrapper);
