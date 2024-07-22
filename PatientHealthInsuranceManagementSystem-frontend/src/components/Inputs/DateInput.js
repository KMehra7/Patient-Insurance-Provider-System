import React, {Component, Fragment} from 'react';
import InputMask from 'react-input-mask';
import {TextField} from '@material-ui/core';

class DateInput extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<InputMask
				mask="9999/99/99"
			  value={this.props.value}
			  onChange={this.props.onChange}
			  name={this.props.name}
			  maskChar="_"
			>
				{() => <TextField
					fullWidth
					type="text"
					name={this.props.name}
					variant="outlined"
					inputProps={{
						placeholder: "YYYY/MM/DD"
					}}
					size="small"
					style={this.props.style}
				/>}
			</InputMask>
		)
	}
}

export default DateInput;
