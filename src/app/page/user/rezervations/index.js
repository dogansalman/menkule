import Header from '../../header';
import Footer from '../../footer';
import appMessage from '../../../../lib/appMessages';
import Rezervations from './rezervations.handlebars'
import RezervationList from './rezervation-list.handlebars'
import advertList from './advert-list.handlebars';
import Advert from './selected-advert.handlebars';
import Tabs from './tabs.handlebars';

export default (params) => {
    let rezervation = [];
    let selectedRezervation = [];
    let adverts = [];
    let selectedAdvert = {};
    let template;

    function renderRezervations(rez){
        return new Promise((resolve, reject) => {
            $("body").zone('rezervation-list')
                .setContentAsync(rez.length > 0 ? RezervationList({rezervations: rez}) : appMessage('no_rezervation'))
                .then((t) => resolve(t))
                .catch(err => reject(err))
        });
    }

  return new Promise((resolve) => {
    Header()
      .then(() => Footer())
      .then(() => $("body").zone('content').setContentAsync(Rezervations())).do(t => template = t)
      .then(() => Menkule.get("/rezervations/" + params.type )).do(r => rezervation = r)
      .then((rezevations) => {

          if(params.type == 'out') {
               return $("body").zone('rezervation-list').setContentAsync(rezevations.length > 0 ? RezervationList({rezervations: rezevations}) : appMessage('no_rezervation'))
                  .then(() => resolve())
          }


          $("body").zone('content').setContentAsync(Rezervations())
              .then((template) => {

                  // Focus out close dropdown
                  $(window).on('click', e => {
                      if (!e.target.closest('#advert-list') && !e.target.closest('.advert-selected')) template.find('#advert-list').addClass("advert-selectlist").removeClass("animated").removeClass("fadeIn");
                  });

                  // Advert dropdown list
                  template.find(".advert-selected").on('click', (e) => {
                      e.preventDefault();
                      template.find('#advert-list').toggleClass("advert-selectlist").toggleClass("animated").toggleClass("fadeIn");
                  });
                  // Get adverts
                  Menkule.get("/adverts").do(a => adverts = a)
                      .then(() => {
                          for (let i = 0; i < adverts.length; i++) { adverts[i].indx = i}
                          template.zone('advert-list').setContentAsync(advertList({adverts: adverts}))
                              .then(() => {
                                  //Select advert
                                  template.find(".advert").on('click', (e) => {
                                      e.preventDefault();
                                      $('#advert-list').toggleClass("advert-selectlist").toggleClass("animated").toggleClass("fadeIn");
                                      for (var i in adverts) {
                                          delete adverts[i]['selected'];
                                      }
                                      Object.assign(adverts[parseInt($(e.currentTarget).attr('data-index'), 10)], {'selected': true});
                                      template.zone('advert-selected').trigger(new $.Event('rendered.template'));
                                  });
                              });
                      })
                      .then(() =>  App.promise(() => rezevations.filter(r => r.rezervation.state == false && r.rezervation.is_cancel == false)))
                      .then((r) => renderRezervations(r))

                  // On select advert
                  template.zone('advert-selected').on('rendered.template', (e) => {
                      template.find('#advert-list').toggleClass("advert-selectlist").toggleClass("animated").toggleClass("fadeIn");
                      selectedAdvert = _.find(adverts, {'selected': true});
                      selectedRezervation = rezervation.filter(r => r.rezervation.advert_id === selectedAdvert.advert.id);
                      $("body").zone('rezervation-list').setContentAsync(selectedRezervation.length > 0 ? RezervationList({rezervations: selectedRezervation}) : appMessage('no_rezervation'))
                          .then(() => $("body").zone('advert-selected').setContentAsync(Advert(selectedAdvert)))
                  })
              })

      })
      .catch((e) => {
        $("body").zone('content').setContentAsync(appMessage('no_rezervation'))
          .then(() => resolve());
      })
      .then(() => resolve());
  })
}
