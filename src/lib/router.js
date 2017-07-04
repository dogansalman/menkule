import Menkule from './menkule';
import App from './app';

let menkule = new Menkule();
let app = new App();


const config = {
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
    '/help/' : 'help',
    '/contact': 'contact',
    '/policy': 'policy',
    '/rezervation/:id': 'rezervation',
    '/search/:state': 'search',
    '/': 'main-page'
}

app.router(config);

//let a = new App();
//console.log(a);

//let apps = new App();
//let router = new Navigo();

//const menkule = new Menkule();

//routing config

//console.log('tested');
//app.router(config);

//router
// .on({
//    '/test': function () {
//    console.log('test');
 //   },
 //   '/products': function () { console.log('asdasd') },
 // })
 // .resolve();
