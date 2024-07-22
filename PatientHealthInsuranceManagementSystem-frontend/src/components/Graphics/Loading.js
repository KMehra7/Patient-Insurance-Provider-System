import React, {Component} from 'react';
import Lottie from 'lottie-react-web';

import loading from '../../images/loading';

import {Modal} from '@material-ui/core';

class Loading extends Component {
  render() {

  	const defaultOptions = {
	    loop: true,
	    autoplay: true, 
	    animationData: loading
	  };

  	return(
  		<Modal open style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
  			<div style={{borderRadius: "50%"}}>
	  			<Lottie
		        options={defaultOptions}
		        width="70px"
						height="70px"
						speed={1.5}
		      />
	      </div>
  		</Modal>
  	);
  }
}
 
export default Loading;