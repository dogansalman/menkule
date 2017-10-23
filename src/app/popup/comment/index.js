import modal from '../modal';
import appMessage from '../../../lib/appMessages';
import comment from './comment.handlebars'

const commentFormRules = {
  comment: [App.validate.REQUIRED, App.validate.STRING]
};

export default (params) => {
  return new Promise((resolve) => {
    modal({template:comment, title: 'Yorum', width:450})
      .then((template) => {
        const openedModal = template.parents('.modal');
        /*
        Disable enter key
         */
        template.find('textarea').on('keydown',function(e) {if(e.keyCode == 13 && !e.shiftKey) e.preventDefault()});
        /*
        Comment
         */
        template.find('button.feedback-btn').on('click', (e) => {
          e.preventDefault();
          $(e.target).disable();
          template.showPreloader(.7)
            .then(() => {
              template.validateFormAsync(commentFormRules)
                .then((cmt) => Menkule.post("/comments", Object.assign(cmt, {advert_id: params.id})))
                .then(() => App.promise(() => openedModal.modal('hide')))
                .then(() => App.notifySuccess('Yorumunuz için teşekkürler.', ''))
                .catch(err => {
                  // If Validate Error
                  if (err instanceof ValidateError) {
                    template.hidePreloader()
                      .then(() => { $(e.target).enable()});
                  }
                  // If dont send message
                  template.hidePreloader()
                    .then(() => template.zone('notification').setContentAsync(appMessage('comments_failed')))
                    .then(() => $(e.target).enable());
                })
            })
        });
     
    })
  })
}