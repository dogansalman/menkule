import modal from '../modal';
import changePassword from './password.handlebars';
import appMessages from '../../../lib/appMessages';

var passwordFormRules = {
  'currentpassword': [App.validate.REQUIRED],
  'password': [App.validate.REQUIRED],
  'reply': [App.validate.REQUIRED, function (value, fields) {
    return ($(fields['reply']).fieldValue() === value);
  }]
};
export default () => {

  return new Promise((resolve) => {

      modal({template: changePassword, title: 'Şifre güncelle', width: 350})
        .then((template) => {

          //get opened modal
          const openedModal = template.parents('.modal');

          template.find('.acceptbtn').on('click', (e) => {
            e.preventDefault();
            $(e.target).disable();
            $(".changepassword-container").formFields().disable();

            template.showPreloader(.7)
              .then((data) => $(".changepassword-container").validateFormAsync(passwordFormRules))
              .then((formData) => Menkule.post('/user/password', formData))
              .then(() => {
                openedModal.modal('hide');
                App.showNotify({ type: 'success', message: 'Şifreniz güncellendi', title: 'Tamam', icon: 'fa fa-bell-o' });
                resolve();
              })
              .catch((err) => {

                $(e.target).enable();
                template.hidePreloader()
                  .then(() => {
                    $(".changepassword-container").formFields().enable();
                    if (err instanceof ValidateError) return template.hidePreloader().then(() => $(err.fields[0]).select());
                    App.promise(() => appMessages('changepass_fail'))
                      .then((errorMessage) => template.zone('notification').setContentAsync(errorMessage))
                  })
              })
          })
        })
  })
}