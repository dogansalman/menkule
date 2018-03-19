import Footer from '../../footer';
import Header from '../../header';
import ResetPassword from './reset-password.handlebars';
import AppMessages from '../../../../lib/appMessages';

let passwordFormRules = {
    'token': [],
    'password': [App.validate.REQUIRED],
    'reply': [App.validate.REQUIRED, function (value, fields) {
        return ($(fields['password']).fieldValue() === value);
    }]
};

export default (params) => {
    return new Promise((resolve) => {
        Header()
            .then(() => Footer())
            .then(() => Menkule.logout())
            .then(() => Menkule.get('/users/password/validate?token=' + location.href.getParameterByName('token')))
            .then(() => $('body').zone('content').setContentAsync(ResetPassword()))
            .then((template) => {

                template.find('.default_btn').on('click', (e) => {
                    e.preventDefault();
                    $(e.target).disable();
                    $(".changepassword-container").formFields().disable();

                    App.showPreloader(.7)
                        .then((data) => $(".changepassword-container").validateFormAsync(passwordFormRules))
                        .then((formData) => Menkule.post('/users/password/reset/token', Object.assign(formData, {token: location.href.getParameterByName('token')} )))
                        .then(() => App.promise(() => $(".changepassword-container").clearForm()))
                        .then(() => App.hidePreloader())
                        .then(() => App.notifySuccess('Şifreniz güncellendi', ''))
                        .then(() => template.find('.container').setContentAsync(AppMessages('password_changed')))
                        .then(() => App.Login().then((user) => App.emit('logged.user', user)))
                        .catch((err) => {
                            $(e.target).enable();
                            App.hidePreloader()
                                .then(() => {
                                    $(".changepassword-container").formFields().enable();
                                    if (err instanceof ValidateError) {
                                        return App.hidePreloader().then(() => $(err.fields[0]).select());
                                    }
                                    App.notifyDanger('Geçersiz veya hatalı işlem', '');

                                })
                        })
                })
            })
            .catch(() => {
                $("body").zone('content').setContentAsync(AppMessages('token_fail'))
                    .then(() => App.hidePreloader());
            })
            .then(() => resolve());
    })
}

