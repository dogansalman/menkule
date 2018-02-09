import loginModal from './login.handlebars'
import modal from '../modal';
import Messages from '../../../lib/appMessages';
import forgotModal from '../forgot';
import config from '../../../lib/configs/config';


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
                                .then((loginForm) => Menkule.post('/auth', Object.assign(loginForm, {grant_type: 'password'} ), 'application/x-www-form-urlencoded' ))
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
                Facebook Login
                * */
                template.find('.login-page-withfacebook').on('click', (e) => {
                    const redirectUri = location.protocol + '//' + location.host + '/sing-in/facebook';
                    console.log(redirectUri);
                    const externalProviderUrl = "http://localhost:9090/social/facebook/sing-in?provider=" + 'Facebook'
                        + "&response_type=token&client_id=" + String(config.facebook_client_id)
                        + "&redirect_uri=" + redirectUri;
                     window.open(externalProviderUrl, "Authenticate Account", "location=0,status=0,width=600,height=750");
                });
                /*
                Enter
                 */
                template.formFields().on('keyup', (e) => {
                    const keyCode = e.which || e.keyCode;
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