import modal from '../../components/modal';
import message from './message.handlebars';
import appMessage from '../../../lib/appMessages';

/*
Message validate
 */
const messageFormRules = {
  message: [App.validate.REQUIRED, App.validate.STRING]
};

export default (recipientDetail) => {
  return new Promise((resolve) => {

    modal({template: message, title: 'Yeni mesaj', width:450, data: recipientDetail})
      .then((template) => {
        /*
        Get modal
         */
        const openedModal = template.parents('.modal');


        // Login on click
        template.find('button.message-btn').on('click', (e) => {
          e.preventDefault();
          $(e.target).disable();
          template.formFields().disable();
          template.showPreloader(.7)
            .then(() => {
              template.validateFormAsync(messageFormRules)
                .then((msg) => Menkule.post("/message", {message: msg.message, user_id:recipientDetail.Id}))
                .then(() => App.promise(() => openedModal.modal('hide')))
                .then(() => App.notifySuccess('Mesajınız iletildi.', 'Teşekkürler.'))
                .catch(err => {

                  // If Validate Error
                  if (err instanceof ValidateError) {
                    template.hidePreloader()
                      .then(() => {
                        template.formFields().enable();
                        $(e.target).enable();
                        return ($(err.fields[0]).select());
                      })
                  } else {
                      // If dont send message
                      template.hidePreloader()
                          .then(() => template.zone('notification').setContentAsync(appMessage('message_failed')))
                          .then(() => template.formFields().enable() && template.formFields().select() && $(e.target).enable());
                  }

                })
            })

        });

      })
  })
}