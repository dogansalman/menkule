import appMessage from '../../../lib/appMessages';
import modal from '../modal';
import visitor from './visitor.handlebars';
/*
Visitor form validate
 */
const visitorFormsRules = {
    fullname: [App.validate.REQUIRED, App.validate.STRING],
    gender: [App.validate.REQUIRED, App.validate.STRING],
    tc: [App.validate.REQUIRED, App.validate.NUMBER,  App.validate.BETWEEN(10,12)],
};

export default () => {
    return new Promise((resolve) => {
        modal({template: visitor, width:450, title: 'Misafir Ekle'})
            .then((template) => {
                /*
                Opened Modal
                 */
                const openedModal = template.parents('.modal');
                /*
                Add
                 */
                template.find('.acceptbtn').on('click', (e) => {
                    e.preventDefault();

                    $(e.target).disable();
                    template.formFields().disable();

                    template.validateFormAsync(visitorFormsRules)
                        .then((forgotForm) => App.showPreloader(forgotForm, .7))
                        .then((visitor) => resolve(visitor))
                        .then(() => App.hidePreloader())
                        .then(() => openedModal.modal('hide'))
                        .catch((err) => {

                            // If Validate Error
                            if (err instanceof ValidateError) {
                                template.formFields().enable();
                                $(e.target).enable();
                                return ($(err.fields[0]).select());
                            }

                            // Hide preloader
                            App.hidePreloader()
                                .then(() => App.promise(() => appMessage('visitor_error')))
                                .then((template) => template.zone('notification').setContentAsync(template))
                                .then(() => template.formFields().enable() && template.formFields().select() && $(e.target).enable());

                        });
                });

                /*
                Enter key
                 */
                template.formFields().on('keyup', (e) => {
                    var keyCode = e.which || e.keyCode;
                    if (keyCode == 13) template.find('button').triggerHandler('click');
                });

                /*
                Focus first form element
                 */
                template.formFields().first().select();
            })
    })


}