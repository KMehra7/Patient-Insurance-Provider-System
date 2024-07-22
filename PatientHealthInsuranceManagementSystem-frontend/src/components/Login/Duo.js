import React, {Component, Fragment} from 'react';
import {Link} from 'react-router-dom';
import empty from 'is-empty';
import withToast from '../../utils/withToast';

import {Grid, TextField, Button, Divider} from '@material-ui/core';

import Loading from '../Graphics/Loading';

class Duo extends Component {
	constructor(props) {
		super(props);
    this.state = {
      data: {
        duo: ''
      },
      loaded: true
    }
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

  onDuo = async () => {
    this.setState({...this.state, loaded: false});
    const resp = await this.props.duoLogin({...this.props.duoData, duo: this.state.data.duo});
    if(!resp.complete) this.props.addToast(resp.error, { appearance: 'error', autoDismiss: true });
    this.setState({...this.state, loaded: true});
  }

  render() {
  	const {theme, dark, register} = this.props;
    const {data, loaded} = this.state;

    const emptyCheck = !empty(data.duo);

  	return(
      <Fragment>
        {!loaded && (<Loading />)}
        <Grid sm={12} md={register ? 8 : 6} container item direction="column" style={{background: "#fff", padding: dark ? "1rem" : "", borderRadius: 6}}>
          <span style={{color: !dark ? theme.primary.main : theme.primary.contrastText, fontSize: "2rem", lineHeight: "1.6rem", marginBottom: "1rem", fontWeight: 500}}>DUO VERIFICATION</span>
          <span style={{color: !dark ? theme.primary.main : theme.primary.contrastText, marginBottom: "0.75rem"}}>A verification code has been sent to your email. We require dual authentication in order to secure your personal information.</span>
          <TextField
            size="small"
            variant="outlined"
            value={data.duo}
            name="duo"
            onChange={this.handleDataChange}
            color="primary"
            inputProps={{
              placeholder: "Duo code"
            }}
            style={{marginBottom: "0.5rem"}}
            fullWidth
          />
          <Button onClick={this.onDuo} variant="contained" fullWidth style={{backgroundColor: !emptyCheck ? "" : "#002868", color: !emptyCheck ? "" : "white", marginBottom: "1rem"}} size="large" disabled={!emptyCheck}>Submit</Button>
        </Grid>
      </Fragment>
  	);
  }
}
 
export default withToast(Duo);

