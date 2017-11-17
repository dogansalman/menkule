import appMessages from '../../../../lib/appMessages';
import Header from '../../header';
import Footer from '../../footer';
import Messages from './messages.handlebars';

export default() => {
  return new Promise((resolve) => {
    Header()
      .then(() => Footer())
      .then(() => Menkule.get("/message"))
      .then((messageList) => $('body').zone('content').setContentAsync(Messages({messages: messageList})))
      .then(() => resolve())
      .catch((err) => {
        $('body').zone('content').setContentAsync(appMessages('error_message_list'))
          .then(() => resolve());
      })
  })
}