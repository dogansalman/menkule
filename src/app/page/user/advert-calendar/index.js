import Header from '../../../page/header';
import Footer from '../../../page/footer';
import appMessage from '../../../../lib/appMessages';
import selectedAdvert from './selected.handlebars';
import advertCalendar from './advert-calendar.handlebars';
import advertDetail from './advert-detail.handlebars';
import advertList from './advert-list.handlebars';

export default () => {
  return new Promise((resolve) => {
    let adverts = [];
    let advert = {};

    Header()
      .then(() => Footer())
      .then(() => Menkule.get("/advert/list").do(a => adverts = a))
      .then(() => $("body").zone('content').setContentAsync(advertCalendar))
      .then((template) => {

        /*
        Focus out close dropdown
         */
        $(window).on('click', e => {
          if (!e.target.closest('#advert-list') && !e.target.closest('.advert-selected')) template.find('#advert-list').addClass("advert-selectlist").removeClass("animated").removeClass("fadeIn");
        });

        /*
        Advert dropdown list
         */
        template.find(".advert-selected").on('click', (e) => {
          e.preventDefault();
          template.find('#advert-list').toggleClass("advert-selectlist").toggleClass("animated").toggleClass("fadeIn");
        });

        /*
        Render selected advert
         */
        template.zone('advert-selected').on('rendered.template', (e) => {
          var selectedAdvert = _.find(adverts, {
            'selected': true
          });
          if (typeof selectedAdvert == "undefined") selectedAdvert = adverts[0];

          template.zone('advert-selected').setContentAsync(selectedAdvert({
            adverts: selectedAdvert
          }))
            .then((advert) => Menkule.post("/advert/detail", {
              'advertId': selectedAdvert.id
            }))
            .then((advert) => {

              //get reserved date
              var reserved_dates = _.map(_.map(_.filter(advert.unavailable_date, function(o) {
                return o.is_reserved;
              }), 'fulldate')).map(function(x) {
                return moment(new Date(moment(x)._d)).format('YYYY/MM/DD');
              });

              //get unavailable date
              var unavailable_dates = _.map(_.map(_.filter(advert.unavailable_date, function(o) {
                return !o.is_reserved;
              }), 'fulldate')).map(function(x) {
                return moment(new Date(moment(x)._d)).format('YYYY/MM/DD');
              });

              //create calendar
              template.find('.flatpickr-calendar').remove();
              template.find('#calendar').flatpickr({
                inline: true,
                mode: "multiple",
                minDate: moment(new Date()).format('DD-MM-YYYY'),
                maxDate: moment(new Date()).add(1, 'year').format('YYYY-MM-DD'),
                disable: reserved_dates,
                defaultDate: unavailable_dates,
                onDayCreate: function(dObj, dStr, fp, dayElem) {
                  if ($(dayElem).hasClass('disabled')) dayElem.innerHTML += "<span class='event reserved'>Rezerve</span>";
                }
              });

              //render advert detail
              template.zone('selected-advert-detail').setContentAsync(advertDetail({ advert: Object.assign(selectedAdvert, {
                'total_reserved': reserved_dates.length
              }, {
                'total_unavailable': unavailable_dates.length
              })}))
              .then(() => {
                //upload event
                template.find('button.update').off('click').on('click', (e) => {
                  e.preventDefault();
                  delete advert["user_id"];
                  //get unavaiable date
                  unavailable_dates = template.find('#calendar').val() != "" ? _.map(template.find('#calendar').val().split(';')).map(function(x) {
                    return {
                      'day': moment(x)._d.getDate(),
                      'month': moment(x)._d.getMonth() + 1,
                      'year': moment(x)._d.getFullYear(),
                      'fulldate': moment(x).format('YYYY-MM-DD')
                    }
                  }) : [];
                  //post upload advert
                  App.showPreloader(.7)
                    .then(() => Menkule.post('/advert/update', Object.assign(advert, {
                      'unavailable_date': unavailable_dates
                    })))
                    .then(() => App.hidePreloader())
                    .then(() => App.notifySuccess('İlanınız güncellendi.', 'Tamam'));
                })
              });
            })
        })


        /*
        Fire render template
         */
        template.zone('advert-selected').trigger(new $.Event('rendered.template'));

        /*
        Get all advert
         */
        App.renderTemplate(template.find('#advert-list-template').html(), { adverts : adverts })
          .then((data) => template.zone('advert-list').setContentAsync(data))
          .then((listTemplate) => {
            //Select advert
            template.find(".advert").on('click', (e) => {
              e.preventDefault();
              $('#advert-list').toggleClass("advert-selectlist").toggleClass("animated").toggleClass("fadeIn");
              for (var i in adverts) { delete adverts[i]['selected']; }
              Object.assign(adverts[parseInt($(e.currentTarget).attr('data-index'), 10)], {'selected' : true});
              template.zone('advert-selected').trigger(new $.Event('rendered.template'));
            });
          });

      }