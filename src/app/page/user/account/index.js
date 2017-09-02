import template from './account.handlebars';
import Header from '../../header';
import Footer from '../../footer';
import '../../../../lib/uploader';
import changePasswordModal from '../../../popup/password';

var userFormRules = {
    email: [App.validate.REQUIRED, App.validate.EMAIL],
    name: [App.validate.REQUIRED, App.validate.STRING],
    lastname: [App.validate.REQUIRED, App.validate.STRING],
    gsm: [App.validate.REQUIRED, App.validate.PHONE]
};

export default () => Header()
    .then(() => Footer())
    .then(() => Menkule.user())
    .then((user) => $('body').zone('content').setContentAsync(template({ user})))
    .then(template => new Promise(resolve => {

        //uploader initalize
        template.find(".photoadd").directUploader();

        //photo upload
        template.find(".photoadd").on('change.photo', function (e) {
            template.find(".profile_photo").attr("src", Menkule.cloudinaryBaseUrl + "/w_150,h_150,c_fill/" + e.photo['result']);
        });

        //change password
        template.find('.changepas-btn').off().on('click', (e) => {
            e.preventDefault();
            changePasswordModal();
        });

        //update profile
        template.find("button[name='update']").off().on("click", (e) => {
            e.preventDefault();

            $(e.target).disable().text('Lütfen bekleyin...');
            template.find(".account-container").formFields().disable();

            template.find(".account-container").validateFormAsync(userFormRules)
                .then((userData) => App.showPreloader(userData, .7))
                .then((userData) => Menkule.post('/user/update', userData))
                .then(() => App.hidePreloader())
                .then(() => App.notifySuccess('Profiliniz güncellendi', 'Tamam'))
                .then(() => {
                  App.emit('updated.user');
                  template.find(".account-container").formFields().enable();
                  $(e.target).enable().text('Tamam');
                })
                .catch((response) => {
                    $(e.target).enable().text('Tamam');
                    template.find(".account-container").formFields().enable();
                    if (response instanceof ValidateError) return $(response.fields[0]).select();
                    App.hidePreloader()
                        .then(() => App.parseJSON(response.responseText))
                        .then(result => App.notifyDanger(result.message, 'Üzgünüz'))
                        .catch(err => App.notifyDanger(response.responseText, 'Üzgünüz'));

                });
        });
      resolve();
    }))
