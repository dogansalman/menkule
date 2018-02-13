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

    function openFacebookPopup(url, w, h){
        // Fixes dual-screen position  Most browsers      Firefox
        let dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        let dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
        let width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        let height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
        let left = ((width / 2) - (w / 2)) + dualScreenLeft;
        let top = ((height / 2) - (h / 2)) + dualScreenTop;
        let facebookPopupWin = window.open(url, 'Authenticate Account', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        // Puts focus on the window
        if (window.focus) {
            facebookPopupWin.focus();
        }
        return facebookPopupWin;
    }


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
                    const redirectUri = location.protocol + '//' + location.host + '/user/social/login';
                    const externalProviderUrl = config.apiAdress + "/social/facebook/sing-in?provider=" + 'Facebook'
                        + "&response_type=token&client_id=" + String(config.facebook_client_id)
                        + "&redirect_uri=" + redirectUri;
                    const popupWin = openFacebookPopup(externalProviderUrl,400,400);

                    // popup window closing
                    var timer = setInterval(function() {

                        if(popupWin.closed) {
                            clearInterval(timer);
                            if(window.localStorage.getItem('fb_failed')) {
                                window.localStorage.removeItem('fb_failed');
                                return;
                            }

                            App.promise(() => openedModal.modal('hide'))
                                .then(() => App.promise(() => Menkule.getToken(true)))
                                .then((token) => App.promise(() => Menkule.saveToken(token)))
                                .then(() => Menkule.user(true))
                                .then((user) => App.emit('logged.user', user))
                        }
                    }, 500);
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