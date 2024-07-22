import React, {Component, Fragment} from 'react';
import {Route, withRouter, Redirect, Switch} from 'react-router-dom';
import PrivateRoute from '../components/Nav/PrivateRoute';
import {connect} from "react-redux";
import empty from 'is-empty';

import {Grid, withWidth, withTheme, ThemeProvider} from '@material-ui/core';
import {createMuiTheme} from '@material-ui/core/styles';

import {state_set_dark} from '../store/actions/dark';
import {getUser, logoutUser} from '../store/actions/user';

import Navbar from '../components/Nav/Navbar';
import Footer from '../components/Nav/Footer';

import Home from './Static/Home';
import About from './Static/About';

import LoginWrapper from './Login/LoginWrapper';

import PatientDashboard from './Patient/Dashboard';
import PatientAccount from './Patient/Account';
import PatientFind from './Patient/Find';

import DoctorDashboard from './Doctor/Dashboard';
import DoctorAccount from './Doctor/Account';

import InsuranceDashboard from './Insurance/Dashboard';
import InsuranceAccount from './Insurance/Account';

class Main extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false
		};
	}

	async componentDidMount() {
		if(!empty(this.props.user.iat)) {
			await this.props.getUser(this.props.user);
			this.setState({...this.state, loaded: true});
		} else {
			this.setState({...this.state, loaded: true});
		}
	}

	render() {
		const {width, dark, user} = this.props;
		const {loaded} = this.state;

		const small = width === "xs" || width === "sm";
		const xs = width === "xs";

		const maxWidth = small ? "100%" : "60rem";

		const theme = createMuiTheme({
		  typography: {
		    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
		  },
		  palette: {
		    primary: {
		      main: dark ? "#fff" : "#002868",
		      contrastText: dark ? "#002868" : "#fff"
		    },
		    secondary: {
		      main: dark ? "#fff" : "#bf0a30",
		      contrastText: dark ? "#bf0a30" : "#fff"
		    },
		    background: {
		      main: dark ? "#002868" : "#fff",
		      shadow: dark ? "rgba(0,0,0,0.4)" : "rgba(233,233,233,1.0)"
		    }
		  }
		});

		return (
			<ThemeProvider theme={theme}>
				{loaded && (<Grid container item direction="column" xs={12}>
					<Navbar logoutUser={this.props.logoutUser} user={user} maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} dark={dark} state_set_dark={this.props.state_set_dark}/>
					<Switch>
						<Route exact path='/' component={() => <Home maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette}/>} />
						<Route exact path='/register/:role' component={() => <LoginWrapper maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} login={false} user={user}/>} />
						<Route exact path='/register' component={() => <LoginWrapper maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} login={false} user={user}/>} />
						<Route exact path='/login/:role' component={() => <LoginWrapper maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} login user={user}/>} />
						<Route exact path='/login' component={() => <LoginWrapper maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} login user={user}/>} />
						<PrivateRoute exact path='/patient/dashboard' component={() => <PatientDashboard maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} />} portal="patient"/>
						<PrivateRoute exact path='/patient/account' component={() => <PatientAccount maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} />} portal="patient"/>
						<PrivateRoute exact path='/patient/find' component={() => <PatientFind maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} />} portal="patient"/>
						<PrivateRoute exact path='/patient/find/:id' component={() => <PatientFind maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} />} portal="patient"/>
						<PrivateRoute exact path='/doctor/dashboard' component={() => <DoctorDashboard maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} />} portal="doctor"/>
						<PrivateRoute exact path='/doctor/account' component={() => <DoctorAccount maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} />} portal="doctor"/>
						<PrivateRoute exact path='/insurance/dashboard' component={() => <InsuranceDashboard maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} />} portal="insurance"/>
						<PrivateRoute exact path='/insurance/account' component={() => <InsuranceAccount maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} />} portal="insurance"/>
						<Route path='*' component={() => <Home maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette}/>} />
		      </Switch>
		      <Footer maxWidth={maxWidth} xs={xs} small={small} theme={theme.palette} dark={dark} state_set_dark={this.props.state_set_dark}/>
	      </Grid>)}
      </ThemeProvider>
		)
	}
}

const mapStateToProps = state => ({
	dark: state.dark,
	user: state.user
});

export default connect(mapStateToProps,{state_set_dark, getUser, logoutUser})(withRouter(withWidth()(Main)));
