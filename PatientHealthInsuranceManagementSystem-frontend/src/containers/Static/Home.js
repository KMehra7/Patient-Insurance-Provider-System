import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import {Grid, Button, ButtonBase, Switch, SwipeableDrawer, ListItem, ListItemText} from '@material-ui/core';
import {Menu} from '@material-ui/icons';

import {rocket} from '../../utils/images';

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			
		}
	}

  render() {
  	const {maxWidth, small, xs, theme, dark} = this.props;
  	const {open} = this.state;

  	return(
  		<Grid xs={12} container item direction="column" alignItems="center" style={{background: theme.background.main, position: "relative"}}>
		  	<img src={rocket} alt="" style={{height: 'calc(100vh - 4rem)', objectFit: "cover", position: "absolute", top: 0, right: 0, width: "100vw"}}/>
  			<Grid xs={12} container item alignItems="center" style={{maxWidth: maxWidth, height: 'calc(100vh - 4rem)'}}>
  				<Grid container item direction="column" justify="center" xs={12} style={{zIndex: 1, padding: small ? "1rem" : "", height: "100%", maxWidth: xs ? "100%" : small ? "90%" : "65%"}}>
  					<span style={{color: "white", fontSize: "3.5rem", fontWeight: 500}}>Health care that inspires</span>
  					<span style={{color: "white", fontSize: "2rem", fontWeight: 300}}>Managing your well-being has never been this easy.</span>
  					<div style={{display: "flex", alignItems: "center", marginTop: "1rem", flexWrap: "wrap", width: "100%"}}>
  						<Link to="/login/patient" style={{width: xs ? "100%" : ""}}><Button variant="contained" style={{width: xs ? "100%" : "", marginRight: xs ? "" : "0.5rem", marginBottom: !xs ? "" : "0.5rem", background: "#bf0a30", color: "white"}}>I NEED CARE</Button></Link>
  						<Link to="/login/doctor" style={{width: xs ? "100%" : ""}}><Button variant="contained" style={{width: xs ? "100%" : "", marginRight: xs ? "" : "0.5rem", marginBottom: !xs ? "" : "0.5rem", background: "#002868", color: "white"}}>I'M A DOCTOR</Button></Link>
  						<Link to="/login/insurance" style={{width: xs ? "100%" : ""}}><Button variant="contained" style={{width: xs ? "100%" : "", background: "#002868", color: "white"}}>I SELL INSURANCE</Button></Link>
  					</div>
  				</Grid>
	      </Grid>
  		</Grid>
  	);
  }
}
 
export default Home;