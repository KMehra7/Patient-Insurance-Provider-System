import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import moment from 'moment';

import {Grid, Divider, Button} from '@material-ui/core';
import {Menu} from '@material-ui/icons';

import Stars from '../Graphics/Stars';

class Review extends Component {
	constructor(props) {
		super(props);
	}

  render() {
  	const {maxWidth, small, xs, theme, dark, review} = this.props;

  	return(
  		<Grid xs={12} container item direction="column" style={{marginTop: "1.25rem"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <span style={{fontSize: "1rem", fontWeight: 500}}>{review.patientname}</span>
          <Stars rating={review.rating}/>
        </div>
        <Divider style={{width: "100%", margin: "0.25rem 0 0.5rem"}}/>
        <span style={{fontWeight: 300, fontSize: "0.9rem"}}>{review.reviewmessage}</span>
  		</Grid>
  	);
  }
}
 
export default Review;