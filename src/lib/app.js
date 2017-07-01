import Navigo from 'navigo';

const templateRoot = "/dist/template/";
const templateStore = {};
let preloadState = true;

//Constructer
function App(){
  this.preloaderElem = $('#page-preloader')[0];
}

App.prototype = Object.create(require('eventemitter').prototype);

App.prototype.showPreloader = function(arg, opacity){
  if (typeof arg == "number") {
    opacity = arg;
    arg = null;
  }
  opacity = typeof opacity != "undefined" ? opacity : 1;
  return new Promise(resolve => {
    if (preloadState == true) return resolve(arg);
    $(this.preloaderElem).css('opacity', 0).show().fadeTo(200, opacity, () => {
      preloadState = true;
      resolve(arg);
    });
  });
};
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

App.prototype.getTemplate = function(templateName, templateData) {
  templateData = templateData || {};
  return new Promise((resolve, reject) => {
    // Before get check cache
    if (templateStore.hasOwnProperty(templateName)) {
      return this.renderTemplate(templateStore[templateName], templateData).then(template => resolve(template));
    }
    $.get(templateRoot + templateName + '/' + templateName + '.html')
      .then(template => this.renderTemplate((templateStore[templateName] = template), templateData))
      .then(template => resolve(template));
  });
};

App.prototype.renderTemplate = function (template, templateData) {
  require("handlebars");
  require("handlebar-helpers");

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Handlebars.compile(template)(templateData));
    }, 0);
  });
};

App.prototype.addStyle = function(styleName) {
  return new Promise((resolve) => {
    if ($("style[data-style-name='" + styleName + "']").size() > 0) return resolve();
    $.get(templateRoot + styleName + '/' + styleName + '.css')
      .then(css => {
        setTimeout(() => {
          $('<style type="text/css" data-style-name="' + styleName + '"></style>').html(css).appendTo("head");
          resolve();
        })
      });
  });
};

App.prototype.notifyDanger = function (message, title) {
  return this.showNotify({message, title, type: 'danger'});
};
App.prototype.notifySuccess = function (message, title) {
  return this.showNotify({message, title});
};

App.prototype.showNotify = function(options) {
  return new Promise(resolve => {
    require('jquery');
    require('notification');

    options = Object.assign({
      'icon': 'fa fa-bell-o',
      'title': '',
      'message': '',
      'type': 'success'
    }, options || {});

    $.notify({ icon: options.icon, title: options.title, message: options.message
    },{
      element: 'body',
      position: null,
      type: options.type,
      allow_dismiss: true,
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
      onShown: (() => resolve())
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
    var Menkule = require('core/menkule.js');
    var Md5 = require('md5');
    searchParameters = Object.assign({
      'guest': '1'
    }, searchParameters || {});
    var query = {
      'checkin': moment(searchParameters.checkin).format('YYYY-MM-DD'),
      'checkout': moment(searchParameters.checkout).format('YYYY-MM-DD'),
      'day' : moment(searchParameters.checkout).diff(moment(searchParameters.checkin),'days')+1,
      'lat' : searchParameters.lat,
      'lng' : searchParameters.lng,
      'guest': searchParameters.guest,
      //'chash': $.md5(searchParameters.lat + searchParameters.lng),
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

App.prototype.router = function(routerConfig){
  var router = new Navigo();
  Object.keys(routerConfig).forEach(path => {
    // key - value bind
    if (typeof routerConfig[path] == 'string') {
      router.on(path, (params,query) => {
        SystemJS.import('template/' + routerConfig[path] + '/' + routerConfig[path] + '.js')
          .then(module => module(params,query))
          .then(() => a.emit('loaded.page'));
      });
      return;
    }
    // key - function bind
    if (typeof routerConfig[path] == 'function') {
      router.on(path, (params) => {
        var result = routerConfig[path](params,query);
        if (!(result instanceof Promise)) result = new Promise((resolve) => resolve(result));
        result.then(() => a.emit('loaded.page'));
      });
      return;
    }
    // key - array bind
    if (typeof routerConfig[path] == 'object' && routerConfig[path].length > 1 && typeof routerConfig[path][0] == 'function') {
      ((path, config) => {
        router.on(path, (params,query) => {
          config[0](params).then((result) => {
            if (result !== true) {
              if (config.length === 3) this.navigate(config[2]);
              return;
            }
            SystemJS.import('template/' + config[1] + '/' + config[1] + '.js')
              .then(module => module(params,query))
              .then(() => a.emit('loaded.page'));
          });
        });
      })(path, routerConfig[path]);
      return;
    }
  });
  return router;
};

App.prototype.PasswordChange = function() {
  var PasswordPopup = require('template/popup-password/popup-password.js');
  return PasswordPopup();
};
App.prototype.Ownershipping = function() {
  var OwnershippingPopup = require('template/popup-homeowner/popup-homeowner.js');
  return OwnershippingPopup();
};
App.prototype.Login = function() {
  var LoginPopup = require('template/popup-login/popup-login.js');
  return new Promise((resolve, reject) => {
    LoginPopup()
      .then(user => resolve(user))
      .catch(err => reject(err));
  });
};

App.prototype.DatePicker = function() {
  var DatePicker = require('template/popup-datetime/popup-datetime.js');
  return new Promise((resolve, reject) => {
    DatePicker()
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
