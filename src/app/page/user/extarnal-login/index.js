import template from './extarnal-login.handlebars';


export default() => {
    return new Promise((resolve) => {
            $("body").zone('content').setContentAsync(template())
            .then(() => {
                App.promise(() => Menkule.saveToken(location.search.toQueryStrObj()))
                    .then(() => App.promise(() => window.close()))
                    .then(() => resolve())
                    .catch((err) => console.log(err));
            })
            .catch((err) => {
                $("body").zone('content').setContentAsync('E-posta adresi ile zaten kayıtlı bir kullanıcı mevcut veya yetki alınamadı.');
                resolve();
            });

    })
}