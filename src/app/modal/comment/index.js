import modal from '../../components/modal';
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
        Comment
         */
        template.find('button.comment-btn').on('click', (e) => {
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
                  } else{
                      // If dont send message
                      template.hidePreloader()
                          .then(() => App.notifyDanger(appMessage('comments_failed'),''))
                          .then(() => $(e.target).enable());
                  }
                })
            })
        });
     
    })
  })
}