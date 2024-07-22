import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {Link} from 'react-router-dom';
import empty from 'is-empty';
import withToast from '../../utils/withToast';

import {Grid, TextField, Button, Divider, Modal} from '@material-ui/core';

import Loading from '../Graphics/Loading';

import {resetPassword} from '../../store/actions/user';

class ForgotPassword extends Component {
	constructor(props) {
		super(props);
    this.state = {
      data: {
        email: ''
      },
      loaded: true,
      submitted: false
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

  onSubmit = async () => {
    this.setState({...this.state, loaded: false});
    const resp = await this.props.resetPassword({usertype: this.props.role, email: this.state.data.email});
    if(!resp.complete) this.props.addToast(resp.error, { appearance: 'error', autoDismiss: true });
    if(resp.complete) this.props.addToast(`Your new password has been sent to ${this.state.data.email}.`, { appearance: 'success' });
    this.setState({...this.state, loaded: true});
    this.props.onClose();
  }

  render() {
  	const {theme, dark, usertype} = this.props;
    const {data, loaded, submitted} = this.state;

    const emptyCheck = !empty(data.email);

  	return(
      <Modal open style={{display: "flex", justifyContent: "center", alignItems: 'center'}} onClose={this.props.onClose}>
        <Fragment>
          {!loaded && (<Loading />)}
          <Grid container item direction="column" style={{background: "#fff", padding: "1.5rem", borderRadius: 6, width: "20rem"}}>
            <Fragment>
              <span style={{color: "#002868", fontSize: "2rem", lineHeight: "1.6rem", marginBottom: "1rem", fontWeight: 500}}>Password Reset</span>
              <span style={{color: '#002868', marginBottom: "0.75rem"}}>Enter your email and we will send you a new password.</span>
              <TextField
                size="small"
                variant="outlined"
                value={data.email}
                name="email"
                onChange={this.handleDataChange}
                color="primary"
                inputProps={{
                  placeholder: "Email"
                }}
                style={{marginBottom: "0.5rem"}}
                fullWidth
              />
              <Button onClick={this.onSubmit} variant="contained" fullWidth style={{backgroundColor: !emptyCheck ? "" : "#002868", color: !emptyCheck ? "" : "white"}} size="large" disabled={!emptyCheck}>Submit</Button>
            </Fragment>
          </Grid>
        </Fragment>
      </Modal>
  	);
  }
}

const mapStateToProps = state => ({
  dark: state.dark,
  user: state.user
});
 
export default connect(mapStateToProps,{resetPassword})(withToast(ForgotPassword));

