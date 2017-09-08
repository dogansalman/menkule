/**
 * Pages
 */
import MainPage from '../../app/page/main';
import HelpPage from '../../app/page/help';
import UserAccount from '../../app/page/user/account';
import Register from '../../app/page/user/register';
import UserActivate from '../../app/page/user/activate';
import UserAdverts from '../../app/page/user/adverts';
import UserAlerts from '../../app/page/user/alerts';
import UserAdvert from '../../app/page/user/advert';
import Contact from '../../app/page/contact';
/**
 * Define routes
 * @type {[*]}
 */
export default [
    //['/detail/advert/:id', () => Menkule.isLogged(), UserAccount ],
    ['/help', HelpPage],
    ['/contact', Contact],
    ['/logout', () => Menkule.logout().then(() => App.promise(() => window.location.href = "/")), MainPage],
    ['/user/account', UserAccount],
    ['/user/activate',  UserActivate ],
    ['/help/:subject', HelpPage],
    [ /^\/$/, MainPage ],
    ['/user/register', Register],
    ['/user/adverts', UserAdverts],
    ['/user/advert/:id', UserAdvert],
    ['/user/alerts', UserAlerts]
];