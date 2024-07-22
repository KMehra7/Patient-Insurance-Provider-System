import React, {Component, Fragment} from 'react';
import { useToasts } from './react-toast-notifications';

export default function withToast(Component) {
  return function WrappedComponent(props) {
    const toastFuncs = useToasts()
    return <Component {...props} {...toastFuncs} />;
  }
}