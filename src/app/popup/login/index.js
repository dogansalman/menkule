import loginTemplate from './login.handlebars'
import modal from '../modal';
import Messages from '../../../lib/appMessages';

export default () => {

    let loginFormRules = {
        email: [App.validate.REQUIRED, App.validate.EMAIL],
        password: [App.validate.REQUIRED]
    };

    return new Promise(resolve => {
        modal({template: 'login', title: 'Üye Giriş', width:350})
            .then(modalContent => {

                // Click login
                modalContent.find('button.login-btn').on('click', (e) => {
                    e.preventDefault();
                    $(e.target).disable();
                    modalContent.formFields().disable();
                    modalContent.showPreloader(.7)
                        .then(() => {
                            modalContent.validateFormAsync(loginFormRules)
                                .then((loginForm) => Menkule.login(loginForm.email, loginForm.password, 'false'))
                                .then(() => Menkule.user())
                                .then((user) => modalContent.parents('.modal').modal('hide').promise().done(() => resolve(user)))
                                .catch(err => {
                                    // If Validate Error
                                    if (err instanceof ValidateError) {
                                        modalContent.hidePreloader()
                                            .then(() => {
                                                modalContent.formFields().enable();
                                                $(e.target).enable();
                                                return ($(err.fields[0]).select());
                                            })
                                    }
                                    // If User not found
                                    modalContent.hidePreloader()
                                        .then(() => App.promise(() => Messages('login_fail')))
                                        .then(template => modalContent.zone('notification').setContentAsync(template))
                                        .then(() => modalContent.formFields().enable() && modalContent.formFields().select() && $(e.target).enable());
                                })
                        })
                });

                // Enter login
                modalContent.formFields().on('keyup', (e) => {
                    var keyCode = e.which || e.keyCode;
                    if (keyCode == 13) modalContent.find('button.login-btn').triggerHandler('click');
                });

                // Focus first form element
                modalContent.formFields().first().select();

            });
    });
}