import React, {Component, Fragment} from 'react';
import {Link} from 'react-router-dom';
import empty from 'is-empty';

import {Grid, Button, ButtonBase, Switch, SwipeableDrawer, ListItem, ListItemText} from '@material-ui/core';
import {Menu, AccountCircle} from '@material-ui/icons';

import {logo, darklogo} from '../../utils/images';

class Navbar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			open: false
		}
	}

	setTheme = () => {
		if(this.props.dark) {
			this.props.state_set_dark(false);
			localStorage.setItem('dark', "false");
		} else {
			this.props.state_set_dark(true);
			localStorage.setItem('dark', "true");
		}
	}

  render() {
  	const {maxWidth, small, xs, theme, dark, user} = this.props;
  	const {open} = this.state;

  	return(
  		<Grid xs={12} container item direction="column" alignItems="center" style={{background: theme.background.main, zIndex: 100}}>
	  		<Grid container item xs={12} style={{padding: "1.2rem 1rem 1rem", boxShadow: `0 3px 5px ${theme.background.shadow}`, justifyContent: "center", zIndex: 98}}>
	  			<Grid container item justify="space-between" alignItems="center" xs={12} style={{maxWidth: maxWidth}}>
	  				<Link to="/" style={{display: 'flex', alignItems: 'center'}}><img src={dark ? darklogo : logo} style={{height: "1.2rem"}} alt=""/></Link>
	  				{!small && (<div style={{display: "flex", alignItems: "center", justifyContent: "flex-end"}}>
	  					{empty(user) && (<Fragment>
		  					<Link to="/register" style={{marginRight: "1.1rem", padding: "3px 9px"}}>
		  						<span style={{fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.75, color: theme.primary.main}}>SIGN UP</span>
		  					</Link>
		  					<Link to="/login">
		  						<Button variant="outlined" color="primary" size="small">
		  							Sign In
		  						</Button>
		  					</Link>
	  					</Fragment>)}
	  					{!empty(user) && (<Fragment>
	  						<Link to={`/${user.usertype}/dashboard`} style={{padding: "3px 9px"}}>
	  							<span style={{fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.75, color: theme.primary.main}}>DASHBOARD</span>
	  						</Link>
	  						{user.usertype === "patient" && (<Link to={`/patient/find`} style={{marginLeft: "0.7rem", padding: "3px 9px"}}>
	  							<span style={{fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.75, color: theme.primary.main}}>FIND A DOCTOR</span>
	  						</Link>)}
	  						<Link to={`/${user.usertype}/account`} style={{marginLeft: "1.2rem"}}>
		  						<Button variant="outlined" color="primary" size="small" style={{display: "flex", alignItems: "center"}}>
		  							<AccountCircle style={{fontSize: "1rem"}}/>
		  							<span style={{margin: "0 0.25rem 0 0.15rem"}}>{user.fname}</span>
		  						</Button>
		  					</Link>
	  					</Fragment>)}
	  				</div>)}
	  				{small && (<ButtonBase onClick={() => this.setState({...this.state, open: true})}>
	  					<Menu style={{fontSize: "1.5rem", color: theme.primary.main}} />
	  				</ButtonBase>)} 
	  				{small && (
	  					<SwipeableDrawer
		            anchor="right"
		            open={this.state.open}
		            onClose={() => this.setState({...this.state, open: false})}
		            onOpen={() => this.setState({...this.state, open: true})}
		          >
		          	<Grid direction="column" style={{background: theme.background.main, height: "100%", paddingTop: "0.5rem"}}>
		          		{empty(user) && (<Fragment>
					          <Link to="/register">
					            <ListItem button style={{minWidth: "15rem", padding: "0.2rem 1.2rem"}}>
						  					<span style={{fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.75, color: theme.primary.main}}>SIGN UP</span>
						          </ListItem>
					          </Link>
					          <Link to="/login">
					            <ListItem button style={{minWidth: "15rem", padding: "0.2rem 1.2rem"}}>
						  					<span style={{fontWeight: 700, fontSize: "0.875rem", lineHeight: 1.75, color: theme.primary.main}}>SIGN IN</span>
						          </ListItem>
					          </Link>
				          </Fragment>)}
				          {!empty(user) && (<Fragment>
			  						<Link to={`/${user.usertype}/dashboard`} style={{marginRight: "1.1rem", padding: "3px 9px"}}>
			  							<ListItem button style={{minWidth: "15rem", padding: "0.2rem 1.2rem"}}>
			  								<span style={{fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.75, color: theme.primary.main}}>DASHBOARD</span>
			  							</ListItem>
			  						</Link>
			  						{user.usertype === "patient" && (<Link to={`/patient/find`} style={{marginRight: "1.1rem", padding: "3px 9px"}}>
			  							<ListItem button style={{minWidth: "15rem", padding: "0.2rem 1.2rem"}}>
			  								<span style={{fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.75, color: theme.primary.main}}>FIND A DOCTOR</span>
			  							</ListItem>
			  						</Link>)}
			  						<Link to={`/${user.usertype}/account`}>
			  							<ListItem button style={{minWidth: "15rem", padding: "0.2rem 1.2rem"}}>
					  						<Button variant="outlined" color="primary" size="small" style={{display: "flex", alignItems: "center"}}>
					  							<AccountCircle style={{fontSize: "1rem"}}/>
					  							<span style={{margin: "0 0.25rem 0 0.15rem"}}>{user.fname}</span>
					  						</Button>
				  						</ListItem>
				  					</Link>
			  					</Fragment>)}
			          </Grid>
		          </SwipeableDrawer>
		        )}
	  			</Grid>
	  		</Grid>
  		</Grid>
  	);
  }
}
 
export default Navbar;