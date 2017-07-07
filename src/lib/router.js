import Navigo from 'navigo';
import EventEmitter from 'event-emitter';

/**
 * Router class
 */
function Router(routerConfig) {
  // Set variables
  this.routerConfig = routerConfig;
  this.navigo = new Navigo(null, false, '#');

  // Load router config
  this.routerConfig.forEach(c => {

    // Sanitize call
    if (typeof c[0] !== 'string' && !(c[0] instanceof RegExp)) c = [ null, c[0] ];

    // Get Pattern
    const pattern = c[0];

    // Get Callbacks
    const callbackChain = c.slice(1, 3);

    // Set callback
    const callback = (params) => {
      const pageResult = callbackChain[callbackChain.length - 1](params);
      const e = new CustomEvent('resolve', { cancelable: false });
      e['params'] = params;
      if (pageResult instanceof Promise) return pageResult.then(result => this.emit('resolve', e));
      this.emit('resolve', e);
    };

    // Set config
    const config = {
      before: (done, params) => {
        if (callbackChain.length > 1) {
          const result = callbackChain[0](params);
          if (result instanceof Promise) return result.then(result => done(result));
          return done(result);
        }
        done(true);
      }
    };

    // Set rule
    pattern ? this.navigo.on(pattern, callback, config) : this.navigo.on(callback, config);

    // Set global hooks
    this.navigo.hooks({
      before: (done, params) => this._onBefore(done, params),
      after: (params) => this._onAfter(params)
    })
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
  done(!e.defaultPrevented);
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
