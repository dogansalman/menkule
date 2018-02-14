import template from './facebook-login.handlebars';
import config from "../../../lib/configs/config";

export default(params) => {

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


    return new Promise((resolve) => {


        params.template.setContentAsync(template())
            .then((component) => {
                component.find('.login-page-withfacebook').on('click', (e) => {
                    const redirectUri = location.protocol + '//' + location.host + '/user/social/login';
                    const externalProviderUrl = config.apiAdress + "/social/facebook/sing-in?provider=" + 'Facebook'
                        + "&response_type=token&client_id=" + String(config.facebook_client_id)
                        + "&redirect_uri=" + redirectUri;
                    const popupWin = openFacebookPopup(externalProviderUrl,400,400);

                    // popup window closing
                    var timer = setInterval(function() {
                        if(popupWin.closed) {
                            clearInterval(timer);
                            if(window.localStorage.getItem('fb_com')) {
                                // close login or other modal
                                if($('.modal').length > 0) $('.modal').modal('hide');
                                App.promise(() => Menkule.getToken(true))
                                    .then((token) => App.promise(() => Menkule.saveToken(token)))
                                    .then(() => Menkule.user(true))
                                    .then((user) => App.emit('logged.user', user))
                                    .then(() => App.promise(() => window.localStorage.removeItem('fb_com')))
                            }
                        }
                    }, 1000);
                });
            });
        resolve();
    });
}