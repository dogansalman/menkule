import appMessages from '../../../../lib/appMessages';
import Header from '../../header';
import Footer from '../../footer';
import Messages from './messages.handlebars';
import Confirm from "../../../modal/confirm";

export default() => {
  return new Promise((resolve) => {

    Header()
      .then(() => Footer())
      .then(() => Menkule.get("/message"))
      .then((messageList) => $('body').zone('content').setContentAsync(Messages({messages: messageList})))
      .then((template) => {

          // focus out dropdown
          $(window).on('click', e => {
              if (!e.target.closest('.dropdown-container'))  template.find('.dropdown-container .open').removeClass('open');
          })
          // open dropdown
          template.find('.dropdown-container .dropdown-btn').on('click', (event) => {
              template.find('.dropdown-container .open').removeClass('open');
              $(event.target).toggleClass('open');
              $(event.target.offsetParent).find('.dropdown').toggleClass('open');
          });
          //on delete message
          template.find('.delete-message').on('click', (e) => {
              const id = $(e.target).attr('data');
              Confirm({
                  message: 'Mesajı silmek istediğinize emin misiniz?',
                  title: 'Mesaj sil'
              })
              .then((openedModal) => {
                  App.showPreloader()
                  .then(() => Menkule.delete('/message/' + id))
                  .then(() => App.promise(() => $(e.target).parents('.message-list-container').remove()))
                  .then(() => openedModal.modal('hide'))
                  .then(() =>  App.hidePreloader())
                  .then(() => App.notifySuccess('Mesajınız silindi',''))
                  .catch((err) => {
                      App.hidePreloader()
                          .then(() => openedModal.modal('hide'))
                          .then(() =>  App.notifyDanger(err.responseJSON.Message, ''))
                          .catch(err => App.notifyDanger(err, 'Beklenmeyen bir hata'));
                  })
              })
              .then(() => Menkule.delete('/message/' + id))
          });
      })
      .then(() => resolve())
      .catch((err) => {
        $('body').zone('content').setContentAsync(appMessages('error_message_list'))
          .then(() => resolve());
      })
  })
}