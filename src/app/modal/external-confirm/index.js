import externalConfirm from './external-confirm.handlebars';
import modal from '../../components/modal';


export default (user) => {
  return new Promise((resolve) => {
    modal({template: externalConfirm, title: 'Kaydınızı Tamamlayın', width:350, data: user})
      .then((template) => {
        /*
        Get modal
         */
        const openedModal = template.parents('.modal');

          /*
            Validate Confirm Form
           */
          var ExternalConfirmValidation = {
              gsm: [App.validate.REQUIRED, App.validate.PHONE],
              password: [App.validate.REQUIRED],
              reply: [App.validate.REQUIRED, function (value, fields) {
                  return ($(fields['reply']).fieldValue() === value);
              }]
          };

        /*
        Save
         */
        template.find('button.send').on('click', (e) => {
          e.preventDefault();

          $(e.target).disable();
          template.formFields().disable();
            template.showPreloader(.7)
            .then(() =>  template.validateFormAsync(ExternalConfirmValidation))
            .then((externalUserData) => Menkule.put('/users/external/confirm', externalUserData))
            .then(() => template.hidePreloader())
            .then(() => openedModal.modal('hide'))
            .then(() => App.notifySuccess('Şifreniz ve gsm numaranız güncellendi. Onay için yönlendiriliyorsunuz...', ''))
            .then(() => App.wait(2000))
            .then(() => App.navigate('/user/activate'))
            .catch((err) => {
                $(e.target).enable();
                template.formFields().enable();
                if (err instanceof ValidateError) return template.hidePreloader().then(() =>  $(err.fields[0]).select());
                template.hidePreloader().then(() => App.notifyDanger(err.responseJSON.Message));
            });
        });

        // Enter
        template.formFields().on('keyup', (e) => {
          var keyCode = e.which || e.keyCode;
          if (keyCode == 13) template.find('button.send').triggerHandler('click');
        });

        // Focus first form element
        template.formFields().first().select();
        resolve();
      })

  })
}