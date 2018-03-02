import Header from '../../header';
import Footer from '../../footer';
import message from './message.handlebars';
import appMessage from '../../../../lib/appMessages';
import Message from '../message';
import messageslist from './messages.handlebars';

export default (params) => {

  const replyFormRules = {
    message: [App.validate.REQUIRED, App.validate.STRING],
  };

  let messages = [];
  let template;

    App.on('new.message', (messages) => {
        template.zone('messages').setContentAsync(messageslist({message: messages.message}))
            .then(() => template.find(".messagelistcontainer").scrollTop(template.find(".messagelistcontainer")[0].scrollHeight))
    });

  return new Promise((resolve) => {
    Header()
      .then(() => Footer())
      .then(() => Menkule.get("/message/" + params.id)).do((msg) => messages = msg)
      .then(() => $("body").zone('content').setContentAsync(message(messages))).do((t) => template = t)
      .then((template) => {

        document.body.setAttribute('class','message-detail');
        /*
        Render messages
         */
        App.emit('new.message', messages);

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
            .then((replyMessage) => Menkule.put('/message/' + params.id, replyMessage))
            .then((reply) => App.promise(() => messages.message.push(reply)))
            .then(() => App.hidePreloader())
            .then(() => App.emit('new.message', messages))
            .then(() => App.promise(() => template.find(".messagereplycontainer").clearForm()))
            .then(() => App.promise(() => template.find('.send-messagebtn').removeClass('writing')))
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
        console.log(err);
        $("body").zone('content').setContentAsync(appMessage('error_message_detail'))
          .then(() => resolve())
      });
  })
}
