import template from './extarnal-login.handlebars';
import externalConfirm from '../external-confirm';

export default() => {
    return new Promise((resolve) => {
            $("body").zone('content').setContentAsync(template())
            .then(() => {
                const params = location.search.toQueryStrObj();
                const d = new Date();
                if(params.hasOwnProperty('err')) {
                    document.body.innerText = params.email + ' ' + params.err;
                    return;
                }
                App.promise(() => Menkule.saveToken(params))
                    .then(() => App.promise(() => window.localStorage.setItem('fb_com', d.toLocaleDateString())))
                    .then(() => App.promise(() => window.close()))
                    .then(() => resolve())
                    .catch((err) => document.body.innerText = err.message || err)
            })
            .catch((err) => {
                document.body.innerText = err.message || err;
            });

    })
}
// Open set password and gsm modal
App.on('logged.user', (user) => {
    if(!user.is_external_confirm) externalConfirm(user);
});