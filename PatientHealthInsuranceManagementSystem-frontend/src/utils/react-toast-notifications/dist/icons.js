'use strict';
const {Error, Close, Done, Warning, Info} = require('@material-ui/icons');
const React = require('react');

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CloseIcon = exports.InfoIcon = exports.FlameIcon = exports.CheckIcon = exports.AlertIcon = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDefaultProps(width) {
  return {
    'aria-hidden': true,
    height: 16,
    width: width,
    viewBox: '0 0 ' + width + ' 16',
    style: {
      display: 'inline-block',
      verticalAlign: 'text-top',
      fill: 'currentColor'
    }
  };
}

var AlertIcon = exports.AlertIcon = function AlertIcon(props) {
  return <Warning style={{fontSize: 18}}/>;
};
var CheckIcon = exports.CheckIcon = function CheckIcon(props) {
  return <Done style={{fontSize: 18}}/>;
};
var FlameIcon = exports.FlameIcon = function FlameIcon(props) {
  return <Error style={{fontSize: 18}}/>;
};
var InfoIcon = exports.InfoIcon = function InfoIcon(props) {
  return <Info style={{fontSize: 18}}/>;
};
var CloseIcon = exports.CloseIcon = function CloseIcon(props) {
  return <Close style={{fontSize: 18}}/>;
};