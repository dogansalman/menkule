export default [
    {
        route: '/user/register',
        method: () => Menkule.isLogged(),
        condition: true,
        backUrl: '/'
    },
    {
        route: '/user/activate',
        method: () => Menkule.isActive(),
        condition: true,
        backUrl: '/'
    }
];







