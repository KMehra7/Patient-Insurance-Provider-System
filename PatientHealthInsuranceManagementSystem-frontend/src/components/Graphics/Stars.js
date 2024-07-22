import React, {Component} from 'react';
import StarRatings from 'react-star-ratings';
import empty from 'is-empty';

class Stars extends Component {
  render() {

  	return(
  		<div style={{...this.props.style, display: "flex", alignItems: "center"}}>
  			<StarRatings
	        rating={this.props.rating}
	        starRatedColor="#bf0a30"
	        numberOfStars={5}
	        starDimension="16px"
	        starSpacing="1px"
	      />
	      {!empty(this.props.number) && (<span style={{fontSize: "0.8rem", marginLeft: "0.3rem", marginBottom: "0.2rem"}}>({this.props.number})</span>)}
  		</div>
  		
  	);
  }
}
 
export default Stars;