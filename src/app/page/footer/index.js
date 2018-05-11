import footer from './footer.handlebars';
import _Footer from '../footer';

const suggestionsForm = {
    email: [App.validate.REQUIRED, App.validate.EMAIL],
};

export  default () => {
    return new Promise((resolve) => {
        $("body").zone('footer').setContentAsync(footer())
            .then((template) => {
                /*
                Enter key
                */
                template.formFields().on('keyup', (e) => {
                    var keyCode = e.which || e.keyCode;
                    if (keyCode == 13) template.find('.sendmail_btn').triggerHandler('click');
                });
                /*
                On click
                */
                template.find('.sendmail_btn').on('click', (e) => {
                    $(e.target).disable();
                    template.formFields().disable();

                    App.showPreloader(.7)
                        .then(() => template.find(".footer-email-suggestions").validateFormAsync(suggestionsForm))
                        .then((suggestions) => Menkule.post('/suggestions', suggestions))
                        .then(() => App.hidePreloader())
                        .then(() => App.notifySuccess('E-posta adresiniz kayıt edildi.', ''))
                        .then(() => App.promise(() => template.formFields().enable() && template.formFields().select() && $(e.target).enable()))
                        .catch((err) => {
                            App.hidePreloader()
                                .then(() => App.promise(() => template.formFields().enable() && template.formFields().select() && $(e.target).enable()))
                                .then(() => {
                                    if (err instanceof ValidateError) {
                                        template.formFields().enable();
                                        $(e.target).enable();
                                        return ($(err.fields[0]).select());
                                    } else {
                                        App.notifyDanger('E-posta adresiniz zaten kayıtlı.', '')
                                    }
                                })
                        });
                });
                resolve();
            })
    })
}
App.on('logged.user', (user) => {
    _Footer();
});


