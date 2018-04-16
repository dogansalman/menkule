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
        .then((template) => {

          template.find('.list.advert').on('click',(e) => {
            if(!$(e.target).closest('.link.detail').length)  App.navigate('/user/advert/' + $(e.target).closest('.advert').attr('data-item'), {}, true)
          })
            template.find('.link.detail').on('click', (e) => {
                if($(e.target).closest('.link.detail').length) App.navigate('/advert/' + $(e.target).closest('.advert').attr('data-item'), {}, true)

            })
        })
      .catch(err => {
          $("body").zone('content').setContentAsync(appMessages('error_adverts'));
      });
      resolve();
  })

}