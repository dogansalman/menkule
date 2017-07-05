import Menkule from './menkule';
import Navigo from 'navigo';
import App from '../lib/app';

let menkule = new Menkule();
let router = new Navigo();
const app = new App();


const routerConfig = {
    '/user/account': [() => menkule.isLogged(), 'user-account', '/user/register'],
    '/user/alert/list': [() => menkule.isLogged(), 'user-alerts', '/user/register'],
    '/user/activate': [() => menkule.isLogged(), 'user-activate', '/user/register'],
    '/user/advert/list': [() => menkule.isLogged(), 'user-adverts', '/user/register'],
    '/user/advert/detail/:id': [() => menkule.isLogged(), 'user-advert', '/user/register'],
    '/user/advert/create': [() => menkule.isLogged(), 'user-advert', '/user/register'],
    '/user/advert/create': [() => menkule.isActive(), 'user-advert', '/user/activate'],
    '/user/messages': [() => menkule.isLogged(), 'user-messages', '/user/register'],
    '/user/messages/:id': [() => menkule.isLogged(), 'user-message', '/user/register'],
    '/user/rezervations/:type': [() => menkule.isLogged(), 'user-rezervations', '/user/register'],
    '/user/advert/calendar': [() => menkule.isLogged(), 'user-advert-calendar', '/user/register'],
    '/logout': [() => menkule.logout().then(() => app.promise(() => false)), 'main-page', '/'],
    '/user/register': [() => menkule.isLogged().equals(false), 'user-register', '/user/account'],
    '/error/:type': 'error',
    '/detail/advert/:id': 'detail',
    '/help/:subject' : 'help',
    '/help' : 'help',
    '/contact': 'contact',
    '/policy': 'policy',
    '/rezervation/:id': 'rezervation',
    '/search/:state': 'search',
    '/': 'main'
}

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
