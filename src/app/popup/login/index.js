import loginModal from './login.handlebars'
import modal from '../modal';
import Messages from '../../../lib/appMessages';

export default () => {

    let loginFormRules = {
        email: [App.validate.REQUIRED, App.validate.EMAIL],
        password: [App.validate.REQUIRED]
    };

    return new Promise(resolve => {
        modal({template: loginModal, title: 'Üye Giriş', width:350})
            .then(Content => {

                // Click login
                Content.find('button.login-btn').on('click', (e) => {
                    e.preventDefault();
                    $(e.target).disable();
                    Content.formFields().disable();
                    Content.showPreloader(.7)
                        .then(() => {
                            Content.validateFormAsync(loginFormRules)
                                .then((loginForm) => Menkule.post('/user/login', loginForm))
                                .then((result) => App.promise(() => Menkule.saveToken(result.result)))
                                .then(() => Menkule.user())
                                .then((user) => Content.parents('.modal').modal('hide').promise().done(() => resolve(user)))
                                .catch(err => {
                                    // If Validate Error
                                    if (err instanceof ValidateError) {
                                        Content.hidePreloader()
                                            .then(() => {
                                                Content.formFields().enable();
                                                $(e.target).enable();
                                                return ($(err.fields[0]).select());
                                            })
                                    }
                                    // If User not found
                                    Content.hidePreloader()
                                        .then(() => App.promise(() => Messages('login_fail')))
                                        .then(template => Content.zone('notification').setContentAsync(template))
                                        .then(() => Content.formFields().enable() && Content.formFields().select() && $(e.target).enable());
                                })
                        })
                });

                // Enter login
                Content.formFields().on('keyup', (e) => {
                    var keyCode = e.which || e.keyCode;
                    if (keyCode == 13) Content.find('button.login-btn').triggerHandler('click');
                });

                // Focus first form element
                Content.formFields().first().select();

            });
    });
}