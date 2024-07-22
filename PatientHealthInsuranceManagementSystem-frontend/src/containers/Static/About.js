import React, {Component, Fragment} from 'react';
import {Link, withRouter} from 'react-router-dom';
import moment from 'moment';
import empty from 'is-empty';

import {TextField, Grid, MenuItem, Button, Divider, withWidth, InputAdornment} from '@material-ui/core';

import Loading from '../../components/Graphics/Loading';

class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  render() {
    const {maxWidth, small, xs, theme, dark} = this.props;
    const {loaded} = this.state;
    
    return (
      <Grid item container xs={12} direction="row" justify="center" style={{backgroundColor: theme.background.main, minHeight: "calc(100vh - 4rem)"}}>
        <Grid item container direction="column" style={{width: maxWidth, padding: small ? "2rem 1rem" : "3rem 0", height: "100%", position: "relative"}}>
          <div style={{display: "flex", alignItems: "center"}}>
            <span style={{color: theme.primary.main, fontSize: "1rem", fontWeight: 400}}>APOLLOCARE</span>
          </div>
          <span style={{color: theme.primary.main, fontSize: "3.3rem", lineHeight: "3.5rem", fontWeight: "500"}}>About us</span>
          <span style={{color: theme.primary.main, fontSize: "1.2rem", marginTop: "1.75rem", fontWeight: 300}}>
            We are four Indiana students with unique technical backgrounds and a common vision to build an innovative health care product. We believe there should be a central location to guide users through the process of finding a doctor, making appointments, and choosing insurance providers.
          </span>
          <span style={{color: theme.primary.main, fontSize: "1.2rem", marginTop: "0.75rem", fontWeight: 300}}>
            The name Apollocare is inspired by the innovative growth from the space program. As NASA was successful in their pursuit of unprecedented growth in the industry, we hope to fundamentally change the user experience in the health care space.
          </span>
          <br/>
          {!xs && (<span style={{color: theme.primary.main, fontSize: "2.3rem", lineHeight: "2.5rem", fontWeight: "500"}}>The Team</span>)}
          <Grid item container direction="row" alignItems="center" justify={!xs ? "flex-start" : "center"} style={{marginTop: "1rem", width: "100%"}}>
            <Grid item container direction="column" alignItems="center" justify="space-between" style={{width: xs ? "90%" : "11rem", paddingRight: "1rem", marginBottom: xs ? "2rem" : ""}}>
              <img src='https://media-exp1.licdn.com/dms/image/C5603AQEosl3cwv7rWw/profile-displayphoto-shrink_400_400/0?e=1606953600&v=beta&t=PxCInV-76g4glGUltVhGaE6t86p5Tsa9GNoq_TMjqXI' alt="" style={{width: "100%", borderRadius: "50%"}}/>
              <span style={{fontSize: "1rem", marginTop: "1rem", textAlign: "center", width: "100%", fontWeight: "bold", color: theme.primary.main}}>Ethan Behar</span>
              <span style={{fontSize: "0.9rem", marginTop: "0.1rem", textAlign: "center", width: "100%", color: theme.primary.main}}>Project Manager</span>
            </Grid>
            <Grid item container direction="column" alignItems="center" justify="space-between" style={{width: xs ? "90%" : "11rem", paddingRight: "1rem", marginBottom: xs ? "2rem" : ""}}>
              <img src='https://media-exp1.licdn.com/dms/image/C4D03AQHYyg3sHf7C2A/profile-displayphoto-shrink_400_400/0?e=1606953600&v=beta&t=qVlawB3vkNZenqcEzDOShLxYjlukpjrOngo2vQVrgYw' alt="" style={{width: "100%", borderRadius: "50%"}}/>
              <span style={{fontSize: "1rem", marginTop: "1rem", textAlign: "center", width: "100%", fontWeight: "bold", color: theme.primary.main}}>Michael Bouvette</span>
              <span style={{fontSize: "0.9rem", marginTop: "0.1rem", textAlign: "center", width: "100%", color: theme.primary.main}}>Database Specialist</span>
            </Grid>
            <Grid item container direction="column" alignItems="center" justify="space-between" style={{width: xs ? "90%" : "11rem", paddingRight: "1rem"}}>
              <img src='https://media-exp1.licdn.com/dms/image/C4E03AQE6uTxiKTuj_Q/profile-displayphoto-shrink_400_400/0?e=1606953600&v=beta&t=ZF6oJ1bKxUyu3x-0R1VDLiIeXVyeDJ0nGcBlkydKQ9w' alt="" style={{width: "100%", borderRadius: "50%"}}/>
              <span style={{fontSize: "1rem", marginTop: "1rem", textAlign: "center", width: "100%", fontWeight: "bold", color: theme.primary.main}}>Jack Joliet</span>
              <span style={{fontSize: "0.9rem", marginTop: "0.1rem", textAlign: "center", width: "100%", color: theme.primary.main}}>Front End Developer</span>
            </Grid>
            <Grid item container direction="column" alignItems="center" justify="space-between" style={{width: xs ? "90%" : "11rem", paddingRight: "1rem"}}>
              <img src='https://media-exp1.licdn.com/dms/image/C4E03AQE6uTxiKTuj_Q/profile-displayphoto-shrink_400_400/0?e=1606953600&v=beta&t=ZF6oJ1bKxUyu3x-0R1VDLiIeXVyeDJ0nGcBlkydKQ9w' alt="" style={{width: "100%", borderRadius: "50%"}}/>
              <span style={{fontSize: "1rem", marginTop: "1rem", textAlign: "center", width: "100%", fontWeight: "bold", color: theme.primary.main}}>Michael Schmitz</span>
              <span style={{fontSize: "0.9rem", marginTop: "0.1rem", textAlign: "center", width: "100%", color: theme.primary.main}}>Back End Developer</span>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default withRouter(About);
