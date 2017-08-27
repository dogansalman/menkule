import template from './activate.handlebars';
import Header from '../../header';
import Footer from '../../footer';

// Validate config
var activationFormRules = {
    'code': [App.validate.REQUIRED, App.validate.NUMBER]
};

export default () => Header()
    .then(() => Footer())
    .then(() =>  $('body').zone('content').setContentAsync(template()))
    .then(template => new Promise(resolve => {

        //Active
        template.find('button.active').on('click', (e) => {
            $(".activation-container")
                .validateFormAsync(activationFormRules)
                .then(activationForm => {
                    App.showPreloader(.7)
                        .then(() => {
                            Menkule.post("/user/active/gsm", {"code": activationForm.code })
                                .then(() => App.hidePreloader())
                                .then(() => App.notifySuccess('Üyeliğiniz aktif edildi.', 'Teşekkürler'))
                                .then(() => App.wait(3000))
                                .then(() => App.navigate('/user/account'))
                                .catch((err) =>{
                                    App.hidePreloader()
                                        .then(() => App.notifyDanger('Aktivasyon kodu hatalı. Lütfen tekrar deneyin.', 'Üzgünüz'))
                                })
                        })
                })
                .catch(fields => App.notifyDanger('Bir hata oluştu. Tekrar deneyin.', 'Üzgünüz'));
        });

        //Resend Code
        template.find('button.resend').on('click', (e) => {
            App.showPreloader()
                .then(() => {
                    Menkule.get("/user/gsm/resend", {})
                        .then(() =>  App.hidePreloader())
                        .then(() => App.notifySuccess('Aktivasyon kodu tekrar iletilmiştir.', 'Tamam'))
                        .catch((err) =>{
                            App.hidePreloader();
                            App.notifyDanger(JSON.parse(err.responseText)['message'], 'Üzgünüz')
                        });
                });
        });
        resolve();
    }));