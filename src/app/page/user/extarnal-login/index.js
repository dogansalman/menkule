import template from './extarnal-login.handlebars';
export default() => {
    return new Promise((resolve) => {
            $("body").zone('content').setContentAsync(template())
            .then(() => {
                const params = location.search.toQueryStrObj();
                const d = new Date();
                if(params.hasOwnProperty('err')) {
                    document.body.innerText = params.email + ' e-posta adresi zaten kayıtlı lütfen. Şifrenizi kullanarak oturumunuzu açabilirsiniz.';
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