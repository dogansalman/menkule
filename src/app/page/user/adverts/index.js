import Header from '../../header';
import Footer from '../../footer';
import template from './adverts.handlebars';
import appMessages from '../../../../lib/appMessages';

export default () => {

  new Promise((resolve) => {
    Header()
      .then(() => Footer())
      .then(() => Menkule.get("/adverts"))
      .then((adverts) =>  adverts.length == 0 ?  $("body").zone('content').setContentAsync(appMessages('advert_not_found')) : $("body").zone('content').setContentAsync(template({adverts})))
      .catch(err => {
          $("body").zone('content').setContentAsync(appMessages('error_adverts'));
      });
      resolve();
  })

}