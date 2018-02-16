import EventEmitter from 'event-emitter';
import 'bootstrap-notify';
import Handlebars from 'handlebars/dist/handlebars.min.js';
import loginModal from '../app/modal/login';

// Private Properties
let preloadState = true;

/**
 * App Constructor
 * @constructor
 */
function App(){
  this.preloaderElem = $('body > #page-preloader')[0];
}

/**
 * Extend App
 */
EventEmitter(App.prototype);

/**
 * Show preloader
 * @param arg
 * @param opacity
 * @return {Promise}
 */
App.prototype.showPreloader = function(arg, opacity){
  if (typeof arg == "number") {
    opacity = arg;
    arg = null;
  }
  opacity = typeof opacity != "undefined" ? opacity : .6;
  return new Promise(resolve => {
    if (preloadState == true) return resolve(arg);
    $(this.preloaderElem).css('opacity', 0).show().fadeTo(200, opacity, () => {
      preloadState = true;
      resolve(arg);
    });
  });
};

/**
 * Hide preloader
 * @param arg
 * @return {Promise}
 */
App.prototype.hidePreloader = function(arg){
  return new Promise(resolve => {
    if (preloadState == false) return resolve(arg);
    $(this.preloaderElem).fadeOut(200, () => {
      preloadState = false;
      $(this.preloaderElem).hide();
      resolve(arg);
    });
  });
};

App.prototype.parseJSON = function (value) {
  return new Promise((resolve, reject) => {
    try {
      resolve(JSON.parse(value));
    } catch (err) {
      reject(value);
    }
  });
};
App.prototype.notifyDanger = function (message, title) {
  return this.showNotify({message, title, type: 'danger'});
};
App.prototype.notifySuccess = function (message, title, clickable = false) {
  return this.showNotify({message, title, clickable});
};
App.prototype.showNotify = function(options) {
  return new Promise(resolve => {
    options = Object.assign({
      'icon': 'fa fa-bell-o',
      'title': '',
      'message': '',
      'type': 'success',
    }, options || {});


   var x = $.notify({ icon: options.icon, title: options.title, message: options.message
    },{
      element: 'body',
      position: null,
      type: options.type,
      allow_dismiss: false,
      newest_on_top: false,
      showProgressbar: false,
      placement: {
        from: "bottom",
        align: "right"
      },
      offset: 20,
      spacing: 10,
      z_index: 1041,
      delay: 5000,
      timer: 1000,
      url_target: '_blank',
      animate: {
        enter: 'animated bounceInUp',
        exit: 'animated bounceOutDown'
      },
      icon_type: 'class',
      onShown: (() => {
        if(options.clickable) $(x.$ele[0]).addClass('clickabled')
          resolve($(x.$ele[0]));
      }),
    });
  });
};
App.prototype.navigate = function(path, queryString) {
  var parts = [];
  queryString = queryString || {};
  Object.keys(queryString).forEach(key => parts.push(key + "=" + encodeURIComponent(queryString[key])));
  window.location = path + (parts.length > 0 ? '?' + parts.join('&') : '');
};
App.prototype.generateAdvertSearchUrl = function(searchParameters) {
  return new Promise(resolve => {
    const _inDate = searchParameters.checkin.split('/')[2] + '-' + searchParameters.checkin.split('/')[1] + '-' + searchParameters.checkin.split('/')[0];
    const _outDate = searchParameters.checkout.split('/')[2] + '-' + searchParameters.checkout.split('/')[1] + '-' + searchParameters.checkout.split('/')[0];
    searchParameters = Object.assign({
      'guest': '1'
    }, searchParameters || {});
    var query = {
      'checkin': moment(new Date(_inDate).toISOString()).format('YYYY-MM-DD'),
      'checkout': moment(new Date(_outDate).toISOString()).format('YYYY-MM-DD'),
      'day' : moment(_outDate).diff(moment(_inDate),'days'),
      'lat' : searchParameters.lat,
      'lng' : searchParameters.lng,
      'guest': searchParameters.guest,
      'login': Menkule.hasToken()
    };
    resolve({'url': '/search/' + searchParameters.name, 'query': query });
  });
};
App.prototype.wait = function(waitTime) {
  return new Promise((resolve, reject) => {
    var t = setTimeout(() => { resolve(t) }, waitTime);
  });
};
App.prototype.promise = function(callback) {
  return new Promise((resolve, reject) => {
    setTimeout(() =>{
      try {
        var returnVal = callback()
        resolve(returnVal);
      } catch (err) {
        reject(err);
      }
    }, 0);
  });
};
App.prototype.isMobile = function(callback) {
  return new Promise(resolve => {
    resolve(window.matchMedia("only screen and (max-width: 768px)").matches);
  });

};

App.prototype.renderTemplate = function (template, templateData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(Handlebars.compile(template)(templateData));
        }, 0);
    });
};


App.prototype.Login = function() {
  return new Promise((resolve, reject) => {
      loginModal()
      .then(user => resolve(user))
      .catch(err => reject(err));
  });
};

App.prototype.validate = {
  REQUIRED: function (value) {
    if(value === null) return false;
    value = typeof value == 'object'  ? value : value.trim();
    if(value.length <= 0) return false;
    return true;
  },
  EMAIL: function (value) {
    if (/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(value) == false) return false;
    return true;
  },
  STRING: function (value) {
    if(value == "") return true;
    if(/^[a-zğ ,./-:üıçöşA-ZĞÜİÇÖŞ()]+$/.test(value) == false) return false;
    return true;
  },
  PHONE: function (value) {
    if(/^[0-9]+$/.test(value) == false || value.length != 10) return false;
    return true;
  },
  NUMBER: function(value) {
    if(/^[0-9]+$/.test(value) == false) return false;
    return true;
  },
  PRICE: function(value) {
    if(/^[0-9].+$/.test(value) == false) return false;
    return true;
  },
  TIME: function(value) {
    if(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(value) == false) return false;
    return true;
  },
  BETWEEN: function (min, max) {
    return function (value) {
      return (value.length > min && value.length < max);
    }
  }
};

export default App;
