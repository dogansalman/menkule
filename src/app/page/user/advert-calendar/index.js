import Header from '../../../page/header';
import Footer from '../../../page/footer';
import appMessage from '../../../../lib/appMessages';
import _selectedAdvert from './selected.handlebars';
import advertCalendar from './advert-calendar.handlebars';
import rezervation from './rezervation.handlebars';
import advertList from './advert-list.handlebars';
import calendarDetail from './calendar-detail.handlebars';
import flatpickr from 'flatpickr';
import rezervationForm from '../../../modal/rezervation-form';

export default () => {
    return new Promise((resolve) => {
        let adverts = [];
        let template = null;
        let selectedAdvert = null;

        function renderAdvertList(){
            return new Promise((resolve) => {
                template.zone('advert-list').setContentAsync(advertList({adverts: adverts}))
                    .then(() => {
                        //Select advert
                        template.find('.advert').on('click', (e) => {
                            $('#advert-list').toggleClass('advert-selectlist').toggleClass('animated').toggleClass('fadeIn');
                            adverts.forEach(a => delete a['selected']);
                            Object.assign(adverts[parseInt($(e.currentTarget).attr('data-index'), 10)], {'selected': true});
                            template.zone('advert-selected').trigger(new $.Event('rendered.template'));
                            renderAdvertList().then(() => renderRezervation(null))
                        });
                    })
                    .then(() => resolve())
            })
        };

        function onRezervationForm(temp) {
            temp.find('button.rezervation-btn').on('click',(e) => {
                rezervationForm(selectedAdvert);
            });

        }

        function renderRezervation(rezervation_id){
            return new Promise((resolve) => {

                 if(!rezervation_id) return template.zone('rezervation-detail').setContentAsync(rezervation(null)).then((temp) => onRezervationForm(temp));
                template.zone('rezervation-detail').showLoading()
                    .then(() => Menkule.get('/rezervations/' + rezervation_id))
                    .then((rez) => template.zone('rezervation-detail').setContentAsync(rezervation(rez)))
                    .then((temp) => App.promise(() => onRezervationForm(temp)))
                    .then(() => resolve())
                    .then(() => template.zone('rezervation-detail').hideLoading())
                    .catch(() => template.zone('rezervation-detail').hideLoading())
            })
        }
        function renderCalendar(advert){
            return new Promise(resolve => {

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

                template.zone('advert-calendar').showLoading()
                    .then(() => {
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

                                if ($(dayElem).hasClass('selected')) dayElem.innerHTML += "<span class='event unavailable'>Dolu</span>";
                                if ($(dayElem).hasClass('disabled')) {
                                    const unavaiableDate = advert.unavailable_date.find(d => moment(new Date(d.fulldate)).format('YYYY/MM/DD') == moment(new Date(dayElem.dateObj)).format('YYYY/MM/DD') && d.rezervation_id);
                                    if(unavaiableDate) {
                                        dayElem.innerHTML += "<span class='event reserved point'>#" + unavaiableDate.rezervation_id + "</span>";
                                        dayElem.setAttribute('data-id', unavaiableDate.rezervation_id);
                                    }
                                }
                            }
                        });

                        // on rezervation click
                        template.find('.event.reserved.point').on('click', (e) => {
                            const rez_id = $(e.target).parents('span').attr('data-id');
                            renderRezervation(rez_id);

                        });
                    })
                    .then(() => template.zone('advert-calendar').hideLoading())
                    .then(() => resolve())
                    .catch(() => template.zone('advert-calendar').hideLoading());

                //render calendar detail
                template.zone('calendar-footer').showLoading()
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
                    })
                    .then(() => template.zone('calendar-footer').hideLoading())
                    .catch(() => template.zone('calendar-footer').hideLoading())

            })
        }

        Header()
            .then(() => Footer())
            .then(() => Menkule.get("/adverts").do(a => adverts = a))
            .then(() => $("body").zone('content').setContentAsync(advertCalendar)).do(t => template = t)
            .then(() => {

                // Focus out close dropdown
                $(window).on('click', e => {
                    if (!e.target.closest('#advert-list') && !e.target.closest('.advert-selected')) template.find('#advert-list').addClass("advert-selectlist").removeClass("animated").removeClass("fadeIn");
                });

                // Advert dropdown list
                template.find(".advert-selected").on('click', (e) => {
                    template.find('#advert-list').toggleClass("advert-selectlist").toggleClass("animated").toggleClass("fadeIn");
                });

                // Render selected advert
                template.zone('advert-selected').on('rendered.template', (e) => {

                    if(adverts.length === 0) return $("body").zone('content').setContentAsync(appMessage('advert_not_found'));

                    selectedAdvert = _.find(adverts, {'selected': true});

                    if (typeof selectedAdvert == "undefined") selectedAdvert = adverts[0];
                    Object.assign(selectedAdvert, {selected: true});

                    template.zone('advert-selected').setContentAsync(_selectedAdvert(selectedAdvert))
                        .then(() => Menkule.get("/adverts/" + selectedAdvert.advert.id))
                        .then((advert) => renderCalendar(advert))
                });

                // Fire render template
                template.zone('advert-selected').trigger(new $.Event('rendered.template'));

                // Get all advert
                renderAdvertList().then(() => renderRezervation(null));

            })
            .then(() => resolve())
            .catch((err) => {
                App.hidePreloader()
                    .then(() => $("body").zone('content').setContentAsync(appMessage('error_adverts')))
            })
    });
}