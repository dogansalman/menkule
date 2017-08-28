import Navigo from 'navigo';
import EventEmitter from 'event-emitter';

/**
 * Router class
 */

function Router(routerConfig) {

  // Set variables
  this.routerConfig = routerConfig;
  this.navigo = new Navigo(window.location.protocol + '//' + window.location.host);

  // Load router config
  this.routerConfig.forEach(c => {

      // Sanitize call
      if (typeof c[0] !== 'string' && !(c[0] instanceof RegExp)) c = [ null, c[0] ];

      // Get Pattern
      const pattern = c[0];

      //Get callbacks
      const reqCallbacks = c.slice(Math.max(c.length - 2, 1))

      //Get CallbackChain Index
      const callbackChainIndex =  0;


      // Set callback
      const callback = (params) => {
          const pageResult = reqCallbacks[callbackChainIndex](params);
          const e = new CustomEvent('resolve', { cancelable: false });
          e['params'] = params;
          if (pageResult instanceof Promise) return pageResult.then(result => this.emit('resolve', e));
          this.emit('resolve', e);

      };

      // Set config
      const config = {
          before: (done, params ) => {
              if (reqCallbacks.length > 1) {
                  const result = reqCallbacks[callbackChainIndex](params);
                  if (result instanceof Promise) return result.then(result => done(result));
                  return done(result);
              }
              done(true);
          }
      };

      // Set rule
      pattern ? this.navigo.on(pattern, callback, config) : this.navigo.on(callback, config);

  });
}


/**
 * Extends event emitter
 * @type {EventEmitter}
 */
EventEmitter(Router.prototype);

/**
 * Router before resolve function
 */
Router.prototype._onAfter = function (params) {
  const e = new CustomEvent('after.resolve', { cancelable: false });
  e['params'] = params;
  this.emit('after.resolve', e);
};

/**
 * Router before resolve function
 */
Router.prototype._onBefore = function (done, params) {

    const e = new CustomEvent('before.resolve', { cancelable: true });
    e['params'] = params;
    this.emit('before.resolve', e);
    done(!e.preventDefault);

};


/**
 * Router resolve function
 */
Router.prototype.resolve = function () {
  if (this.navigo.resolve(window.location.href) === false) this.emit('resolve');
};


/**
 * Exports
 */
export default Router;
