import Navigo from 'navigo';

/**
 * Router class
 */
class Router {
  constructor(routerConfig) {
    this.routerConfig = routerConfig;
    this.navigo = new Navigo(null, false, '#');
    this.loadConfig();
  }

  loadConfig() {
    this.routerConfig.forEach(c => {
      // Get Pattern
      const pattern = c[0];
      // Get Callbacks
      const callbackChain = c.slice(1);

      console.log(callbackChain);
    });
  }
}

/**
 * Router resolve function
 */
Router.prototype.resolve = function () {

};

/**
 * Exports
 */
export default Router;



/*

///TODO dinamik olarak sytle dosyalarını import et

    Object.keys(routerConfig).forEach(path => {
        // key - value bind
        if (typeof routerConfig[path] == 'string') {
            router.on(path, (params,query) => {
                require('../template/' + routerConfig[path] + '/' + routerConfig[path] + '.css');
                let main = require('../template/' + routerConfig[path] + '/' + routerConfig[path]).default();
                app.emit('loaded.page');
            });
            return;
        }
        // key - function bind
        if (typeof routerConfig[path] == 'function') {
            router.on(path, (params) => {
                var result = routerConfig[path](params,query);
                if (!(result instanceof Promise)) result = new Promise((resolve) => resolve(result));
                app.emit('loaded.page');
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

                        //SystemJS.import('template/' + config[1] + '/' + config[1] + '.js')
                        //  .then(module => module(params,query))
                        //  .then(() => a.emit('loaded.page'));
                    });
                });
            })(path, routerConfig[path]);
            return;
        }
    });
    router.resolve();
*/