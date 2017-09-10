import Header from '../../header';
import Footer from '../../footer';
import message from './message.handlebars';
import appMessage from '../../../../lib/appMessages';
import Message from '../message';

export default (params) => {

  const replyFormRules = {
    message: [App.validate.REQUIRED, App.validate.STRING],
  };

  return new Promise((resolve) => {
    Header()
      .then(() => Footer())
      .then(() => Menkule.post("/message/detail", { 'uniqId': params.id }))
      .then((messages) => $("body").zone('content').setContentAsync(message({message: messages})))
      .then((template) => {

        /*
        Message autoscroll
        */
        if (template.find(".messagelistcontainer")) template.find(".messagelistcontainer").scrollTop(template.find(".messagelistcontainer")[0].scrollHeight);



       /*
       Enter repy message
        */
        template.find(".messagereplytext").on('keyup', (e) => {
          $(e.target).val().length > 0 ? template.find('.send-messagebtn').addClass('writing') : template.find('.send-messagebtn').removeClass('writing')
          var keyCode = e.which || e.keyCode;
          if (keyCode == 13) template.find('.send-messagebtn').click();
        });

        /*
        Reply message button
         */
        template.find('.send-messagebtn').on('click', e => {
          template.find(".messagereplycontainer").validateFormAsync(replyFormRules)
            .then((replyMessage) => App.showPreloader(replyMessage, .7))
            .then((replyMessage) => Menkule.post('/message/reply', Object.assign(replyMessage, { 'id': params.id })))
            .then(() => App.hidePreloader())
            .then(() => App.emit('new.message', params.id))
            .catch((err) => {
              if (err instanceof ValidateError) return App.hidePreloader().then(() => $(err.fields[0]).select());
              App.hidePreloader()
                .then(() => App.parseJSON(err.responseText))
                .then(o => App.notifyDanger(o.result || o.message, 'Üzgünüz'))
                .catch(o => App.notifyDanger(o, 'Beklenmeyen bir hata'));
            });
        });

      })
      .then(() => resolve())
      .catch((err) => {
        $("body").zone('content').setContentAsync(appMessage('error_message_detail'))
          .then(() => resolve())
      });
  })
}
App.on('new.message', (id) => {
  Message({id: id});
});