import Header from '../../header';
import Footer from '../../footer';
import appMessage from '../../../../lib/appMessages';
import Rezervations from './rezervations.handlebars'
import _Rezervations from '../rezervations'
import RezervationList from './rezervation-list.handlebars'
import advertList from './advert-list.handlebars';
import Advert from './selected-advert.handlebars';
import Tabs from './tabs.handlebars';
import ConfirmRezervations from '../rezervation/confirmRezervation.handlebars';
import Confirm from "../../../modal/confirm";

export default (params) => {
    let rezervation = [];
    let selectedRezervation = [];
    let adverts = [];
    let selectedAdvert = {};
    let template;

    function renderRezervations(rez,type_is_out = false){
        return new Promise((resolve, reject) => {
            $("body").zone('rezervation-list')
                .setContentAsync(rez.length > 0 ? RezervationList({rezervations: rez, type_is_out: type_is_out}) : appMessage('no_rezervation'))
                .then((rezListTemplate) => {
                    rezListTemplate.find(".approved-btn").on("click", (e) => {
                        const rez_id = $(e.target).attr("item-data");
                        let modal;
                        e.preventDefault();
                        Confirm({message: appMessage ('rezervation_approved_confirm'), title: appMessage('rezervation_approved_title')}).do(m => modal = m)
                            .then(() => Menkule.put('/rezervations/approve/' + rez_id))
                            .then(() => App.notifySuccess('Rezervasyon onaylandı.',''))
                            .then(() => _Rezervations(params))
                            .then(() => modal.modal('hide'))
                            .catch((err) => {

                                if(err.status === 501) {
                                    const existRezervation  = Object.assign({}, { rezervations: Array.isArray(err.responseJSON) ? err.responseJSON : [err.responseJSON] });
                                    const rezervationConfirmMessage = ConfirmRezervations(existRezervation);
                                    App.promise(() => modal.modal('hide'))
                                        .then(() => Confirm({title: 'Önemli Uyarı', message: rezervationConfirmMessage})).do(m => modal = m)
                                        .then(() => Menkule.put('/rezervations/force/approve/' + rez_id, existRezervation))
                                        .then(() => modal.modal('hide'))
                                        .then(() => App.notifySuccess('Rezervasyon onaylandı.'))
                                        .then(() => _Rezervations(params))
                                        .catch((err) => App.notifyDanger(err.responseJSON.Message || err, '').then(() => modal.modal('hide')))
                                } else {
                                    App.notifyDanger(err.responseJSON.Message, '')
                                        .then(() => modal.modal('hide'))
                                }
                            })
                    });

                    rezListTemplate.find('.cancelled-btn').on('click', (e) => {
                        const rez_id = $(e.target).attr('item-data');
                        let modal;
                        e.preventDefault();
                        Confirm({message: appMessage ('rezervation_cancel_confirm'), title: appMessage('rezervation_cancel_title')}).do(m => modal = m)
                            .then(() => Menkule.get('/rezervations/cancel/' + rez_id))
                            .then(() => App.notifySuccess('Rezervasyon iptal edildi!',''))
                            .then(() => _Rezervations(params))
                            .then(() => modal.modal('hide'))
                            .catch((err) => {
                                App.notifyDanger(err.responseJSON.Message, 'Üzgünüz')
                                    .then(() => modal.modal('hide'))
                            })
                    });

                    // open dropdown
                    rezListTemplate.find('.dropdown-container .dropdown-btn').on('click', (event) => {
                        rezListTemplate.find('.dropdown-container .open').removeClass('open');
                        $(event.target).toggleClass('open');
                        $(event.target.offsetParent).find('.dropdown').toggleClass('open');
                    });
                })
                .then(() => resolve())
                .catch(err => reject(err))
        });
    }
    function renderTabs(rez, type_is_out = false){

        return new Promise((resolve,reject) => {
            App.promise(() => {
                return {
                    approved: rez.filter(r => !r.rezervation.is_cancel && r.rezervation.state).length,
                    canceled: rez.filter(r => r.rezervation.is_cancel && !r.rezervation.state).length,
                    waiting: rez.filter(r => !r.rezervation.is_cancel && !r.rezervation.state).length
                }
            })
            .then((tabParams) =>  $("body").zone('tabs').setContentAsync(Tabs(tabParams)))
            .then((tabTemplate) => {

                // filter waiting rezervation
                tabTemplate.find('div.waiting').on('click', (e) => {
                    App.promise(() => rezervation.filter(r => r.rezervation.state === false && r.rezervation.is_cancel === false))
                        .then((r) => { renderRezervations(r, type_is_out)});
                });

                // filter cancelled rezervation
                tabTemplate.find('div.cancaled').on('click', (e) => {
                    App.promise(() => rezervation.filter(r => r.rezervation.state === false && r.rezervation.is_cancel === true))
                        .then((r) => renderRezervations(r, type_is_out));
                });

                // filter approved rezervation
                tabTemplate.find('div.approved').on('click', (e) => {
                    App.promise(() => rezervation.filter(r => r.rezervation.state === true && r.rezervation.is_cancel === false))
                        .then((r) => renderRezervations(r, type_is_out));
                });
            })
            .then(() => resolve());
        })
    }

    return new Promise((resolve) => {
            Header()
              .then(() => Footer())
              .then(() => App.promise(() => params.type === 'in' ? { dropdown: true} : { dropdown: false }))
              .then((p) => $("body").zone('content').setContentAsync(Rezervations(p))).do(t => template = t)
              .then(() => Menkule.get("/rezervations/" + params.type )).do(r => rezervation = r)
              .then((rezevations) => {

                  // On out rezervations
                  if(params.type === 'out') return renderRezervations(rezevations, true).then(() => renderTabs(rezevations, true)).then(() => resolve());

                  // On select advert
                  template.zone('advert-selected').on('rendered.template', (e) => {
                      template.find('#advert-list').toggleClass("advert-selectlist").toggleClass("animated").toggleClass("fadeIn");
                      selectedAdvert = _.find(adverts, {'selected': true});
                      selectedRezervation = rezervation.filter(r => r.rezervation.advert_id === selectedAdvert.advert.id);

                      renderRezervations(selectedRezervation).then(() => template.zone('advert-selected').setContentAsync(Advert(selectedAdvert)))
                          .then(() => renderTabs(selectedRezervation));
                  });

                  // Focus out close dropdown
                  $(window).on('click', e => {
                      if ((e.target.closest('#advert-list') && !e.target.closest('.advert-selected')) || (!e.target.closest('#advert-list') && !e.target.closest('.advert-selected'))) template.find('#advert-list').addClass("advert-selectlist").removeClass("animated").removeClass("fadeIn");
                      if (!e.target.closest('.dropdown-btn'))  template.find('.dropdown-container .open').removeClass('open');
                  });

                  // Advert dropdown list
                  template.find(".advert-selected").on('click', (e) => {
                      e.preventDefault();
                      template.find('#advert-list').toggleClass("advert-selectlist").toggleClass("animated").toggleClass("fadeIn");
                  });

                  // Get adverts
                  Menkule.get("/rezervations/adverts").do(a => adverts = a)
                      .then(() => {
                          for (let i = 0; i < adverts.length; i++) { adverts[i].indx = i}
                          template.zone('advert-list').setContentAsync(advertList({adverts: adverts}))
                              .then(() => {
                                  //Select advert
                                  template.find(".advert").on('click', (e) => {
                                      e.preventDefault();
                                      $('#advert-list').toggleClass("advert-selectlist").toggleClass("animated").toggleClass("fadeIn");

                                      for (var i in adverts) {   delete adverts[i]['selected'];  }
                                      const selectedIndex = $(e.currentTarget).attr('data-index');
                                      // If default selected
                                      if(selectedIndex < 0) {
                                          return App.promise(() => rezevations.filter(r => r.rezervation.state == false && r.rezervation.is_cancel == false))
                                              .then((r) => renderRezervations(r).then(() => renderTabs(r)))
                                      }
                                      const selectedAdvert = adverts[parseInt(selectedIndex, 10)];
                                      Object.assign(selectedAdvert, {'selected': true});
                                      template.zone('advert-selected').trigger(new $.Event('rendered.template'));
                                  });
                              });
                      })
                      .then(() =>  App.promise(() => rezevations.filter(r => r.rezervation.state == false && r.rezervation.is_cancel == false)))
                      .then((r) => {
                          renderRezervations(r).then(() => renderTabs(r));
                      });

              })
              .catch((e) => {
                $("body").zone('content').setContentAsync(appMessage('no_rezervation'))
                  .then(() => resolve());
              })
              .then(() => resolve());
      })
}


