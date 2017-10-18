import Header from '../header';
import Footer from '../footer';
import template from './contact.handlebars';

/*
Contact form validate
 */
var contactFormRules = {
    'name': [App.validate.REQUIRED, App.validate.STRING],
    'email': [App.validate.REQUIRED, App.validate.EMAIL],
    'message': [App.validate.REQUIRED, App.validate.STRING],
};

export default () => {
    return new Promise((resolve) => {
    Header()
        .then(() => Footer())
        .then(() =>  $("body").zone('content').setContentAsync(template))
        .then((template) => {

        /*
        Send form
         */
            template.find('.send').on('click', (e) => {
                $(".contactpage-container")
                    .validateFormAsync(contactFormRules)
                    .then(contactForm => {
                        App.showPreloader(.7)
                            .then(() => Menkule.post('/contact', contactForm))
                            .then(() => App.hidePreloader())
                            .then(() => App.notifySuccess('Mesajınız iletildi', 'Teşekkürler'))
                            .then(() => App.promise(() => $(".contactpage-container").clearForm()))
                            .catch((err) => {
                                App.hidePreloader().then(() => App.notifyDanger(err.responseJSON.Nessage, 'Uzgünüz'));
                            });
                    })
            });

        })
        resolve();

    })
}