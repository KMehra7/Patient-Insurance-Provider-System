import React, {Component, Fragment} from 'react';
import { DefaultToast } from '../../utils/react-toast-notifications';

export default ({ children, ...props }) => (
  <DefaultToast {...props} style={{
  	width: "90vw",
  	maxWidth: "40rem",
  	fontWeight: "300",
  	borderRadius: "6px",
  	minHeight: 0
  }}>
    {children}
  </DefaultToast>
);