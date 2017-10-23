import modal from '../modal';
import feedback from './feedback.handlebars';
import appMessage from '../../../lib/appMessages';

const feedbackFormRules = {
  description: [App.validate.REQUIRED, App.validate.STRING],
  fullname: [App.validate.REQUIRED, App.validate.STRING],
  email: [App.validate.REQUIRED, App.validate.EMAIL]
};

export default(params) => {
  return new Promise((resolve) => {
    modal({template: feedback, title: 'Gerş bildirim', width: 450})
      .then((template) => {
        /*
        Disable enter key
         */
        template.find('textarea').on('keydown',function(e) {if(e.keyCode == 13 && !e.shiftKey) e.preventDefault()});
        /*
        Feedback
         */
        template.find('button.feedback-btn').on('click', (e) => {
          e.preventDefault();
          $(e.target).disable();
          template.showPreloader(.7)
            .then(() => {
              template.validateFormAsync(feedbackFormRules)
                .then((fdbck) => Menkule.post("/feedbacks", Object.assign(fdbck, {id: params.id})))
                .then(() => App.promise(() => template.modal('hide')))
                .then(() => App.notifySuccess('Geri bildiriminiz iletilmiştir.', 'Teşekkürler.'))
                .catch(err => {
                  console.log(err);
                  // If Validate Error
                  if (err instanceof ValidateError) {
                    template.hidePreloader()
                      .then(() => { $(e.target).enable()});
                  }
                  // If dont send message
                  template.hidePreloader()
                    .then(() =>  template.zone('notification').setContentAsync(appMessage('feedback_failed')))
                    .then(() => $(e.target).enable());
                })
            })
        });
        
      })
  })
}