export default [
    {
        route: '/user/register',
        method: () => Menkule.isLogged(),
        condition: true,
        backUrl: '/'
    },
    {
        route: '/user/activate',
        method: () => Menkule.isLogged(),
        condition: false,
        backUrl: '/'
    },
    {
        route: '/user/activate',
        method: () => Menkule.isActive(),
        condition: true,
        backUrl: '/'
    },
    {
        route: '/user/adverts',
        method: () => Menkule.isLogged(),
        condition: false,
        backUrl: '/'
    },
    {
        route: '/user/adverts',
        method: () => Menkule.hasOwnershipping(),
        condition: false,
        backUrl: '/'
    },
    {
        route: '/user/advert',
        method: () => Menkule.isActive(),
        condition: false,
        backUrl: '/user/activate'
    },
    {
        route: '/user/alerts',
        method: () => Menkule.isLogged(),
        condition: false,
        backUrl: '/'
    },
    {
        route: '/user/messages',
        method: () => Menkule.isLogged(),
        condition: false,
        backUrl: '/'
    },
    {
        route: '/user/advert/calendar',
        method: () => Menkule.isLogged(),
        condition: false,
        backUrl: '/'
    },
    {
        route: '/user/social/login',
        method: () => Menkule.isLogged(),
        condition: true,
        backUrl: '/'
    },
    {
        route: '/user/advert/calendar',
        method: () => Menkule.hasOwnershipping(),
        condition: false,
        backUrl: '/'
    },
];







