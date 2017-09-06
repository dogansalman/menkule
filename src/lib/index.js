import _Menkule from './menkule';
import _App from './app';
import Router from './router';
import './extend';
import _Map from './map';
import Handlebars from 'handlebars/dist/handlebars';


// Declare global variables
const m = window.Menkule = new _Menkule();
const a = window.App = new _App();
const h = window.Gmap= new _Map();

window.Handlebars = Handlebars;

/*
Register helpers global handlebars
 */

Handlebars.registerHelper('noop', function(options) {
    return options.fn(this);
});


console.log(Handlebars.helpers);

export {
  m as Menkule,
  a as App,
  h as Gmap,
  Router,
    Handlebars
}

