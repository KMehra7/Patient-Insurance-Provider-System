import React, {Component, Fragment} from 'react';
import InputMask from 'react-input-mask';
import {TextField, Grid, Select} from '@material-ui/core';
import {states} from "../../utils/options";

class AddressInput extends Component {
	constructor(props) {
		super(props);
	}

	onChange = e => {
		e.preventDefault();
		this.props.onChange(e.target.value.replace(/\D+/g, ''));
	}

	render() {
		const {data, small} = this.props;

		return (
			<div style={{width: "100%"}}>
				<Grid container item xs={12}>
					<Grid container item direction="column" xs={12} md={8} style={{paddingRight: small ? "" : "0.5rem"}}>
						<span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Address</span>
						<TextField
							fullWidth
							type="text"
							name="address1"
							variant="outlined"
							inputProps={{
								placeholder: "123 E St"
							}}
							size="small"
							value={data.address1}
							onChange={this.props.onChange}
						/>
					</Grid>
					<Grid container item xs={12} md={4} style={{marginTop: !small ? "" : "0.5rem"}}>
						<span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Address 2</span>
						<TextField
							fullWidth
							type="text"
							name="address2"
							variant="outlined"
							inputProps={{
								placeholder: "Apt/Room"
							}}
							size="small"
							value={data.address2}
							onChange={this.props.onChange}
						/>
					</Grid>
					<Grid container item xs={12} md={5} style={{marginTop: "0.5rem", paddingRight: small ? "" : "0.5rem"}}>
						<span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>City</span>
						<TextField
							fullWidth
							type="text"
							name="city"
							variant="outlined"
							inputProps={{
								placeholder: "City"
							}}
							size="small"
							value={data.city}
							onChange={this.props.onChange}
						/>
					</Grid>
					<Grid container item xs={12} md={3} style={{marginTop: "0.5rem", paddingRight: small ? "" : "0.5rem"}}>
						<span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>State</span>
						<Select
              native
              fullWidth
              name="state1"
              placeholder="State"
              variant="outlined"
              value={data.state1}
              size="small"
              margin="dense"
              onChange={this.props.onChange}
            >
              {states.map((x, i) =>
                <option key={i} value={x}>{x}</option>
              )}
            </Select>
					</Grid>
					<Grid container item xs={12} md={4} style={{marginTop: "0.5rem"}}>
						<span style={{fontSize: "0.9rem", marginBottom: "0.25rem"}}>Zip</span>
						<TextField
							fullWidth
							type="text"
							name="zipcode"
							variant="outlined"
							inputProps={{
								placeholder: "47404"
							}}
							size="small"
							value={data.zipcode}
							onChange={this.props.onChange}
						/>
					</Grid>
				</Grid>
			</div>
		)
	}
}

export default AddressInput;
