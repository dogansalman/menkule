import _Menkule from './menkule';
import _App from './app';
import Router from './router';
import './extend';

// Declare global variables
const m = window.Menkule = new _Menkule();
const a = window.App = new _App();

export {
  m as Menkule,
  a as App,
  Router
}