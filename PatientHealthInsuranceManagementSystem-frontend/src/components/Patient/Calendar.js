import React, {Component, Fragment} from 'react';
import {Link} from 'react-router-dom';
import moment from 'moment';
import empty from 'is-empty';

import {Grid, Divider, Button} from '@material-ui/core';
import {Menu, NavigateNext, NavigateBefore} from '@material-ui/icons';

import Loading from '../Graphics/Loading';

import {addWeekday} from '../../utils/addWeekday';
import {replaceTime} from '../../utils/options';

class Calendar extends Component {
	constructor(props) {
		super(props);
    this.state = {
      loaded: false,
      offset: 0,
      currentDate: new Date()
    }
	}

  async componentDidMount() {
    await this.props.getAppointments({startdate: moment.utc().format('MM-DD-YYYY'), did: this.props.doctor.id});
    this.setState({...this.state, loaded: true});
  }

  onChangeWeek = async next => {
    const {offset} = this.state;
    this.setState({...this.state, loaded: false});
    const resp = await this.props.getAppointments({startdate: addWeekday(moment.utc(), next ? offset + 5 : offset - 5).format('MM-DD-YYYY'), did: this.props.doctor.id});
    if(resp.complete) {
      this.setState({...this.state, offset: next ? offset + 5 : offset - 5, loaded: true});
    } else {
      this.setState({...this.state, loaded: true});
    }
  }

  onAddAppointment = async data => {
    const currentMinutes = (this.state.currentDate.getHours() * 60) + this.state.currentDate.getMinutes();
    if(data.starttime < currentMinutes && moment.utc().format('MM-DD-YYYY') === moment.utc(data.appointmentdate).format('MM-DD-YYYY')) {
      this.props.onError('This time is no longer available.');
    } else {
      this.setState({...this.state, loaded: false});
      const resp = await this.props.addAppointment({...data, did: this.props.doctor.id, pid: this.props.user.id});
      if(!resp.complete) {
        this.props.onError(resp.error);
      }
      this.setState({...this.state, loaded: true});
    }
  } 

  render() {
  	const {maxWidth, small, xs, theme, dark, appointments, user} = this.props;
    const {loaded, offset, currentDate} = this.state;

    const currentMinutes = (currentDate.getHours() * 60) + currentDate.getMinutes();

  	return(
      <Fragment>
        {!loaded && (<Loading />)}
    		<Grid xs={12} container item>
          <Grid xs={12} container item justify="space-between">
            <span style={{fontSize: "1.5rem", fontWeight: 400, marginBottom: "0.5rem"}}>Book an Appointment</span>
            <div style={{display: "flex", alignItems: "center"}}>
              {(offset > 0) && (<NavigateBefore onClick={() => this.onChangeWeek(false)} style={{fontSize: "2rem", marginRight: "0.5rem", cursor: "pointer", color: "black"}}/>)}
              <NavigateNext onClick={() => this.onChangeWeek(true)} style={{fontSize: "2rem", cursor: "pointer", color: "black"}}/>
            </div>
          </Grid>
    			<Grid container item xs={2} direction="column" style={{borderRight: "1px solid #ddd"}}>
    				<div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "0.5rem"}}/>
    				<div style={{display: "flex", height: '3rem', alignItems: 'center', position: "relative"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem", flex: 1}}>9 am</span>
    					<Divider style={{flex: 1}}/>
    					<Divider style={{width: "25%", position: "absolute", right: 0, bottom: 0}}/>
    				</div>
    				<div style={{display: "flex", height: '3rem', alignItems: 'center', position: "relative"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem", flex: 1}}>10 am</span>
    					<Divider style={{flex: 1}}/>
    					<Divider style={{width: "25%", position: "absolute", right: 0, bottom: 0}}/>
    				</div>
    				<div style={{display: "flex", height: "3rem", alignItems: 'center', position: "relative"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem", flex: 1}}>11 am</span>
    					<Divider style={{flex: 1}}/>
    					<Divider style={{width: "25%", position: "absolute", right: 0, bottom: 0}}/>
    				</div>
    				<div style={{display: "flex", height: "3rem", alignItems: 'center', position: "relative"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem", flex: 1}}>12 pm</span>
    					<Divider style={{flex: 1}}/>
    					<Divider style={{width: "25%", position: "absolute", right: 0, bottom: 0}}/>
    				</div>
    				<div style={{display: "flex", height: "3rem", alignItems: 'center', position: "relative"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem", flex: 1}}>1 pm</span>
    					<Divider style={{flex: 1}}/>
    					<Divider style={{width: "25%", position: "absolute", right: 0, bottom: 0}}/>
    				</div>
    				<div style={{display: "flex", height: "3rem", alignItems: 'center', position: "relative"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem", flex: 1}}>2 pm</span>
    					<Divider style={{flex: 1}}/>
    					<Divider style={{width: "25%", position: "absolute", right: 0, bottom: 0}}/>
    				</div>
    				<div style={{display: "flex", height: "3rem", alignItems: 'center', position: "relative"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem", flex: 1}}>3 pm</span>
    					<Divider style={{flex: 1}}/>
    					<Divider style={{width: "25%", position: "absolute", right: 0, bottom: 0}}/>
    				</div>
    				<div style={{display: "flex", height: "3rem", alignItems: 'center', position: "relative"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem", flex: 1}}>4 pm</span>
    					<Divider style={{flex: 1}}/>
    					<Divider style={{width: "25%", position: "absolute", right: 0, bottom: 0}}/>
    				</div>
    				<div style={{display: "flex", height: "1.5rem", alignItems: 'flex-end', position: "relative"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem", flex: 1, marginBottom: "-0.4rem"}}>5 pm</span>
    					<Divider style={{flex: 1}}/>
    				</div>
    			</Grid>
    			<Grid container item xs={2} direction="column" style={{borderRight: "1px solid #ddd", position: "relative"}}>
    				<Divider style={{width: "100%", position: "absolute", right: 0, bottom: 0, color: "#ddd"}}/>
    				<div style={{borderBottom: "1px solid #ddd", borderTop: "1px solid #ddd", display: "flex", justifyContent: "center", alignItems: "center", height: "calc(2rem - 2px)"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem"}}>{addWeekday(moment.utc(), offset).format('ddd, M/D')}</span>
    				</div>
    				{replaceTime(appointments.filter(item => moment.utc(item.appointmentdate).format('MM-DD-YYYY') === addWeekday(moment.utc(), offset).format('MM-DD-YYYY'))).map((row, i) => (
              <Fragment key={i}>
      					{!row.pid && (<Button onClick={() => this.onAddAppointment({appointmentdate: addWeekday(moment.utc(), offset).format('MM-DD-YYYY'), ...row})} style={{height: "1.5rem"}} disabled={(row.starttime < currentMinutes) && empty(offset)}>
      						<span style={{fontSize: "0.8rem", fontWeight: 300}}>BOOK</span>
      					</Button>)}
                {row.pid && (<div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "1.5rem", background: row.pid === user.id ? "green" : "red"}}>
                  <span style={{fontSize: "0.8rem", fontWeight: 300, color: 'white'}}>{row.pid === user.id ? "MY APPT" : "BOOKED"}</span>
                </div>)}
              </Fragment>
    				))}
    			</Grid>
    			<Grid container item xs={2} direction="column" style={{borderRight: "1px solid #ddd", position: "relative"}}>
    				<Divider style={{width: "100%", position: "absolute", right: 0, bottom: 0, color: "#ddd"}}/>
    				<div style={{borderBottom: "1px solid #ddd", borderTop: "1px solid #ddd", display: "flex", justifyContent: "center", alignItems: "center", height: "calc(2rem - 2px)"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem"}}>{addWeekday(moment.utc(), offset + 1).format('ddd, M/D')}</span>
    				</div>
    				{replaceTime(appointments.filter(item => moment.utc(item.appointmentdate).format('MM-DD-YYYY') === addWeekday(moment.utc(), offset + 1).format('MM-DD-YYYY'))).map((row, i) => (
    					<Fragment key={i}>
                {!row.pid && (<Button onClick={() => this.onAddAppointment({appointmentdate: addWeekday(moment.utc(), offset + 1).format('MM-DD-YYYY'), ...row})} style={{height: "1.5rem"}}>
                  <span style={{fontSize: "0.8rem", fontWeight: 300}}>BOOK</span>
                </Button>)}
                {row.pid && (<div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "1.5rem", background: row.pid === user.id ? "green" : "red"}}>
                  <span style={{fontSize: "0.8rem", fontWeight: 300, color: 'white'}}>{row.pid === user.id ? "MY APPT" : "BOOKED"}</span>
                </div>)}
              </Fragment>
    				))}
    			</Grid>
    			<Grid container item xs={2} direction="column" style={{borderRight: "1px solid #ddd", position: "relative"}}>
    				<Divider style={{width: "100%", position: "absolute", right: 0, bottom: 0, color: "#ddd"}}/>
    				<div style={{borderBottom: "1px solid #ddd", borderTop: "1px solid #ddd", display: "flex", justifyContent: "center", alignItems: "center", height: "calc(2rem - 2px)"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem"}}>{addWeekday(moment.utc(), offset + 2).format('ddd, M/D')}</span>
    				</div>
    				{replaceTime(appointments.filter(item => moment.utc(item.appointmentdate).format('MM-DD-YYYY') === addWeekday(moment.utc(), offset + 2).format('MM-DD-YYYY'))).map((row, i) => (
    					<Fragment key={i}>
                {!row.pid && (<Button onClick={() => this.onAddAppointment({appointmentdate: addWeekday(moment.utc(), offset + 2).format('MM-DD-YYYY'), ...row})} style={{height: "1.5rem"}}>
                  <span style={{fontSize: "0.8rem", fontWeight: 300}}>BOOK</span>
                </Button>)}
                {row.pid && (<div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "1.5rem", background: row.pid === user.id ? "green" : "red"}}>
                  <span style={{fontSize: "0.8rem", fontWeight: 300, color: 'white'}}>{row.pid === user.id ? "MY APPT" : "BOOKED"}</span>
                </div>)}
              </Fragment>
    				))}
    			</Grid>
    			<Grid container item xs={2} direction="column" style={{borderRight: "1px solid #ddd", position: "relative"}}>
    				<Divider style={{width: "100%", position: "absolute", right: 0, bottom: 0, color: "#ddd"}}/>
    				<div style={{borderBottom: "1px solid #ddd", borderTop: "1px solid #ddd", display: "flex", justifyContent: "center", alignItems: "center", height: "calc(2rem - 2px)"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem"}}>{addWeekday(moment.utc(), offset + 3).format('ddd, M/D')}</span>
    				</div>
    				{replaceTime(appointments.filter(item => moment.utc(item.appointmentdate).format('MM-DD-YYYY') === addWeekday(moment.utc(), offset + 3).format('MM-DD-YYYY'))).map((row, i) => (
    					<Fragment key={i}>
                {!row.pid && (<Button onClick={() => this.onAddAppointment({appointmentdate: addWeekday(moment.utc(), offset + 3).format('MM-DD-YYYY'), ...row})} style={{height: "1.5rem"}}>
                  <span style={{fontSize: "0.8rem", fontWeight: 300}}>BOOK</span>
                </Button>)}
                {row.pid && (<div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "1.5rem", background: row.pid === user.id ? "green" : "red"}}>
                  <span style={{fontSize: "0.8rem", fontWeight: 300, color: 'white'}}>{row.pid === user.id ? "MY APPT" : "BOOKED"}</span>
                </div>)}
              </Fragment>
    				))}
    			</Grid>
    			<Grid container item xs={2} direction="column" style={{borderRight: "1px solid #ddd", position: "relative"}}>
    				<Divider style={{width: "100%", position: "absolute", right: 0, bottom: 0, color: "#ddd"}}/>
    				<div style={{borderBottom: "1px solid #ddd", borderTop: "1px solid #ddd", display: "flex", justifyContent: "center", alignItems: "center", height: "calc(2rem - 2px)"}}>
    					<span style={{fontWeight: 300, fontSize: "0.8rem"}}>{addWeekday(moment.utc(), offset + 4).format('ddd, M/D')}</span>
    				</div>
    				{replaceTime(appointments.filter(item => moment.utc(item.appointmentdate).format('MM-DD-YYYY') === addWeekday(moment.utc(), offset + 4).format('MM-DD-YYYY'))).map((row, i) => (
    					<Fragment key={i}>
                {!row.pid && (<Button onClick={() => this.onAddAppointment({appointmentdate: addWeekday(moment.utc(), offset + 4).format('MM-DD-YYYY'), ...row})} style={{height: "1.5rem"}}>
                  <span style={{fontSize: "0.8rem", fontWeight: 300}}>BOOK</span>
                </Button>)}
                {row.pid && (<div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "1.5rem", background: row.pid === user.id ? "green" : "red"}}>
                  <span style={{fontSize: "0.8rem", fontWeight: 300, color: 'white'}}>{row.pid === user.id ? "MY APPT" : "BOOKED"}</span>
                </div>)}
              </Fragment>
    				))}
    			</Grid>
    		</Grid>
      </Fragment>
  	);
  }
}
 
export default Calendar;