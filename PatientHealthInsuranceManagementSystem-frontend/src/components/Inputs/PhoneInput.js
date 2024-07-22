import React, {Component, Fragment} from 'react';
import InputMask from 'react-input-mask';
import {TextField} from '@material-ui/core';

class PhoneInput extends Component {
	constructor(props) {
		super(props);
	}

	onChange = e => {
		e.preventDefault();
		this.props.onChange(e.target.value.replace(/\D+/g, ''));
	}

	render() {
		return (
			<InputMask
				mask="(999) 999-9999"
			  value={this.props.value}
			  onChange={this.onChange}
			  name={this.props.name}
			  maskChar="_"
			>
				{() => <TextField
					fullWidth
					type="text"
					name={this.props.name}
					variant="outlined"
					inputProps={{
						placeholder: "Phone Number"
					}}
					size="small"
					style={this.props.style}
				/>}
			</InputMask>
		)
	}
}

export default PhoneInput;
