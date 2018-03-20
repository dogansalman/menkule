import template from './activate.handlebars';
import Header from '../../header';
import Footer from '../../footer';

// Validate config
var activationFormRules = {
    'code': [App.validate.REQUIRED, App.validate.NUMBER]
};


export default (params) => Header()
    .then(() => Footer())
    .then(() =>  $('body').zone('content').setContentAsync(template()))
    .then(template => new Promise(resolve => {

        //Active
        template.find('button.active').on('click', (e) => {
            $(".activation-container")
                .validateFormAsync(activationFormRules)
                .then(activationForm => {
                    App.showPreloader()
                        .then(() => {
                            Menkule.post("/users/approve/gsm", {"code": activationForm.code })
                                .then(() => App.hidePreloader())
                                .then(() => App.notifySuccess('Üyeliğiniz aktif edildi.', 'Teşekkürler'))
                                .then(() => App.wait(3000))
                                .then(() => App.navigate('/'))
                                .catch((err) => {
                                    App.hidePreloader()
                                        .then(() => App.notifyDanger('Aktivasyon kodu hatalı. Lütfen tekrar deneyin.', ''))
                                })
                        })
                })
                .catch(err => {
                    if (err instanceof ValidateError) return App.hidePreloader().then(() =>  $(err.fields[0]).select());
                    App.hidePreloader().then(() => App.notifyDanger('Bir hata oluştu. Tekrar deneyin.', ''));
                });
        });

        //Resend Code
        template.find('a.resend').on('click', (e) => {
            App.showPreloader()
                .then(() => {
                    Menkule.get("/users/validate/gsm/send", {})
                        .then(() =>  App.hidePreloader())
                        .then(() => App.notifySuccess('Aktivasyon kodu tekrar iletilmiştir.', 'Tamam'))
                        .then(() => template.zone('countdown').countdown(4))
                        .catch((err) => {
                            if (err instanceof ValidateError) return App.hidePreloader().then(() =>  $(err.fields[0]).select());
                            App.hidePreloader().then(() => App.notifyDanger(err.responseJSON.Message, ''));
                        });
                });
        });

        //Enter
        template.formFields().on('keyup', (e) => {
            var keyCode = e.which || e.keyCode;
            if (keyCode == 13) template.find('button.active').triggerHandler('click');
        });
        resolve();
    }));