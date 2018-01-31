import Header from '../../../page/header';
import Footer from '../../../page/footer';
import appMessage from '../../../../lib/appMessages';
import _selectedAdvert from './selected.handlebars';
import advertCalendar from './advert-calendar.handlebars';
import advertDetail from './advert-detail.handlebars';
import advertList from './advert-list.handlebars';
import calendarDetail from './calendar-detail.handlebars';
import flatpickr from 'flatpickr';

export default () => {
    return new Promise((resolve) => {
        let adverts = [];
        let advert = {};

        Header()
            .then(() => Footer())
            .then(() => Menkule.get("/adverts").do(a => adverts = a))
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

                    if(adverts.length === 0) $("body").zone('content').setContentAsync(appMessage('advert_not_found'));

                    var selectedAdvert = _.find(adverts, {
                        'selected': true
                    });
                    if (typeof selectedAdvert == "undefined") selectedAdvert = adverts[0];

                    template.zone('advert-selected').setContentAsync(_selectedAdvert(selectedAdvert))
                        .then((advert) => Menkule.get("/adverts/" + selectedAdvert.advert.id))
                        .then((advert) => {

                            //get reserved date
                            var reserved_dates = _.map(_.map(_.filter(advert.unavailable_date, function (o) {
                                return o.rezervation_id > 0;
                            }), 'fulldate')).map(function (x) {
                                return moment(new Date(moment(x)._d)).format('YYYY/MM/DD');
                            });
                            //get unavailable date
                            var unavailable_dates = _.map(_.map(_.filter(advert.unavailable_date, function (o) {
                                return o.rezervation_id === 0;
                            }), 'fulldate')).map(function (x) {
                                return moment(new Date(moment(x)._d)).format('YYYY/MM/DD');
                            });

                            //create calendar
                            template.find('.flatpickr-calendar').remove();
                            flatpickr.localize(flatpickr.l10ns.tr);
                            flatpickr(template.find('#calendar')[0], {
                                inline: true,
                                mode: "multiple",
                                minDate: moment(new Date()).format('DD-MM-YYYY'),
                                maxDate: moment(new Date()).add(1, 'year').format('YYYY-MM-DD'),
                                disable: reserved_dates,
                                defaultDate: unavailable_dates,
                                onDayCreate: function (dObj, dStr, fp, dayElem) {
                                    if ($(dayElem).hasClass('disabled')) dayElem.innerHTML += "<span class='event reserved'>Rez</span>";
                                }
                            });
                            //render advert detail
                            template.zone('selected-advert-detail').setContentAsync(advertDetail(Object.assign(selectedAdvert, { 'total_reserved': reserved_dates.length }, { 'total_unavailable': unavailable_dates.length })))
                                .then(() => template.zone('calendar-footer').setContentAsync(calendarDetail({reserved: reserved_dates.length, unavaiable: unavailable_dates.length, percent: (reserved_dates.length / 365 * 100).toFixed(2)})))
                                .then(() => {
                                    //upload event
                                    template.find('button.update').off('click').on('click', (e) => {
                                        e.preventDefault();
                                        delete advert["user_id"];
                                        //get unavaiable date
                                        unavailable_dates = template.find('#calendar').val() != "" ? _.map(template.find('#calendar').val().split(',')).map(function (x) {
                                            return {
                                                'day': moment(x)._d.getDate(),
                                                'month': moment(x)._d.getMonth() + 1,
                                                'year': moment(x)._d.getFullYear(),
                                                'fulldate': moment(x).format('YYYY-MM-DD')
                                            }
                                        }) : [];
                                        //post upload advert
                                        App.showPreloader(.7)
                                            .then(() => Menkule.put('/dates/unavailable/' + advert.id, unavailable_dates))
                                            .then(() => App.hidePreloader())
                                            .then(() => App.notifySuccess('İlanınızın takvini güncellendi.', ''));
                                    })
                                });
                        })
                });

                /*
                Fire render template
                 */
                template.zone('advert-selected').trigger(new $.Event('rendered.template'));

                /*
                Get all advert
                 */
                //TODO fix index refresh problem
                for (let i = 0; i < adverts.length; i++) { adverts[i].indx = i}
                template.zone('advert-list').setContentAsync(advertList({adverts: adverts}))
                    .then((listTemplate) => {
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
            .then(() => resolve())
            .catch((err) => {
                App.hidePreloader()
                    .then(() => $("body").zone('content').setContentAsync(appMessage('error_adverts')))
            })
    });
}