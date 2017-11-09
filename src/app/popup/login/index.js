import loginModal from './login.handlebars'
import modal from '../modal';
import Messages from '../../../lib/appMessages';
import forgotModal from '../forgot';

export default () => {

    const loginFormRules = {
        username: [App.validate.REQUIRED, App.validate.EMAIL],
        password: [App.validate.REQUIRED]
    };

    return new Promise(resolve => {
        modal({template: loginModal, title: 'Üye Giriş', width:350})
            .then(template => {

                const openedModal = template.parents('.modal');
                /*
                Login
                 */
                template.find('button.login-btn').on('click', (e) => {
                    e.preventDefault();
                    $(e.target).disable();
                    template.formFields().disable();
                    template.showPreloader(.7)
                        .then(() => {
                            template.validateFormAsync(loginFormRules)
                                .then((loginForm) => Menkule.post('/auth/login', Object.assign(loginForm, {grant_type: 'password'} ), 'application/x-www-form-urlencoded' ))
                                .then((result) => App.promise(() => Menkule.saveToken(result)))
                                .then(() => Menkule.user())
                                .then((user) => template.parents('.modal').modal('hide').promise().done(() => resolve(user)))
                                .catch(err => {
                                    // If Validate Error
                                    if (err instanceof ValidateError) {
                                        template.hidePreloader()
                                            .then(() => {
                                                template.formFields().enable();
                                                $(e.target).enable();
                                                return ($(err.fields[0]).select());
                                            })
                                    }
                                    // If User not found
                                    template.hidePreloader()
                                        .then(() => App.promise(() => Messages('login_fail')))
                                        .then(message => template.zone('notification').setContentAsync(message))
                                        .then(() => template.formFields().enable() && $(e.target).enable());
                                })
                        })
                });

                /*
                Enter
                 */
                template.formFields().on('keyup', (e) => {
                    var keyCode = e.which || e.keyCode;
                    if (keyCode == 13) template.find('button.login-btn').triggerHandler('click');
                });

                /*
                Forgot password
                 */
                template.find('.forgotpassword').on('click', (e) => {
                  openedModal.modal('hide');
                  forgotModal();
                });


                /*
                Focus first form element
                 */
                template.formFields().first().select();

            });
    });
}