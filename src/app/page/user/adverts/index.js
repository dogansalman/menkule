import Header from '../../header';
import Footer from '../../footer';
import template from './adverts.handlebars';
import appMessages from '../../../../lib/appMessages';

export default () => {

  new Promise((resolve) => {
    Header()
      .then(() => Footer())
      .then(() => Menkule.get("/advert/list"))
      .then((adverts) => $("body").zone('content').setContentAsync(template({adverts})))
      .catch(err => {
        $("body").zone('content').setContentAsync(appMessages('error_advert_list'));
        resolve();
      });
  })

}