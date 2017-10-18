import forgot from './forgot.handlebars';
import modal from '../modal';
import appMessages from '../../../lib/appMessages';

export default () => {
  return new Promise((resolve) => {
    modal({template: forgot, title: 'Şifre Hatırlat', width:450})
      .then((template) => {
        /*
          Validate forgot password
         */
        var forgotFormsRules = {
          email: [App.validate.REQUIRED, App.validate.EMAIL],
        };

        /*
        Get modal
         */
        const openedModal = template.parents('.modal');

        /*
        Forgot password
         */
        template.find('button.forgot-btn').on('click', (e) => {
          e.preventDefault();

          $(e.target).disable();
          template.formFields().disable();
            template.showPreloader(.7)
            .then(() =>  template.validateFormAsync(forgotFormsRules))
            .then((forgotForm) => Menkule.post('/users/password/forgot', { 'email': forgotForm.email }))
            .then(() => template.hidePreloader())
            .then(() => openedModal.modal('hide'))
            .then(() => App.notifySuccess('Şifreniz eposta adresinize iletilmiştir.', ''))
            .catch((err) => {
              /*
              Hide preloader
             */
              template.hidePreloader()
                .then(() => App.promise(() => appMessages('forgot_fail')))
                .then((message) => template.zone('notification').setContentAsync(message))
                .then(() => template.formFields().enable() && template.formFields().select() && $(e.target).enable());

              /*
              If Validate Error
              */
              if (err instanceof ValidateError) {
                template.formFields().enable();
                $(e.target).enable();
                return ($(err.fields[0]).select());
              }



            });
        });

        // Enter login
        template.formFields().on('keyup', (e) => {
          var keyCode = e.which || e.keyCode;
          if (keyCode == 13) template.find('button.forgot-btn').triggerHandler('click');
        });

        // Focus first form element
        template.formFields().first().select();

        resolve();
      })

  })
}