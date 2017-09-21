/**
 * Pages
 */
import Main from '../../app/page/main';
import Help from '../../app/page/help';
import Contact from '../../app/page/contact';
import Error from '../../app/page/error';
import Search from '../../app/page/search';
import Advert from '../../app/page/advert';
import Rezervation from '../../app/page/rezervation';
import Register from '../../app/page/user/register';
import UserPolicy from '../../app/page/user/policy';
import UserAccount from '../../app/page/user/account';
import UserActivate from '../../app/page/user/activate';
import UserAdverts from '../../app/page/user/adverts';
import UserAlerts from '../../app/page/user/alerts';
import UserAdvert from '../../app/page/user/advert';
import UserRezervation from '../../app/page/user/rezervations';
import UserAdvertCalendar from '../../app/page/user/advert-calendar';
import UserMessages from '../../app/page/user/messages';
import UserMessage from '../../app/page/user/message';
/**
 * Define routes
 * @type {[*]}
 */
export default [
    //['/detail/advert/:id', () => Menkule.isLogged(), UserAccount ],
    ['/help', Help],
    ['/contact', Contact],
    ['/search/:state', Search],
    ['/advert/:id', Advert],
    ['/rezervation/:id', Rezervation],
    ['/logout', () => Menkule.logout().then(() => App.promise(() => window.location.href = "/")), Main],
    ['/user/account', UserAccount],
    ['/user/activate',  UserActivate ],
    ['/help/:subject', Help],
    ['/error/:error', Error],
    [ /^\/$/, Main ],
    ['/user/register', Register],
    ['/user/policy', UserPolicy],
    ['/user/adverts', UserAdverts],
    ['/user/advert/calendar', UserAdvertCalendar],
    ['/user/advert/:id', UserAdvert],
    ['/user/advert', UserAdvert],
    ['/user/alerts', UserAlerts],
    ['/user/rezervations/:type', UserRezervation],
    ['/user/messages', UserMessages],
    ['/user/messages/:id', UserMessage]
];