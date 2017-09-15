import Footer from '../footer';
import Header from '../header';
import Fancybox from  '@fancyapps/fancybox';
import Datetime from 'flatpickr';
import appMessage from '../../../lib/appMessages';
import Advert from './advert.handlebars';
import Comment from './comment.handlebars';
import Price from './price.handlebars';

export default () => {
    /*
    Rezervation rules
     */
    const rezervationRules = {
        'date': function (value) {
            if(!value || value.split(' - ').length < 2) return false;
            return true;
        }
    };

    /*
    When user logged
     */
    App.on('logged.user', (user) => {
        Advert(user);
    });

    return new Promise((resolve) => {
        /*
        Advert
         */
        let advert = {};

        Header()
            .then(() => Footer())
            .then(() => Menkule.post('/search/advert/detail', { 'advertId': params ? params.id : null }))
            .do(a => advert = a)
            .do(() =>  Object.assign(advert, {loggin: Menkule.hasToken()}))
            .then((advert) => $("body").zone('content').setContentAsync(Advert(advert)))
            .then((template) => {

                /*
                Inıt Gmap
                 */
                template.find("#map").createMap({scroll: true}).centerTo({
                    'lat': advert.latitude,
                    'lng': advert.longitude
                }).zoom(15).addMarker({
                    lat: advert.latitude,
                    lng: advert.longitude
                })


                /*
                Render comments
                 */
                template.zone('comments').setContentAsync( advert.comments.length > 0 ? Comment({comments: advert.comments}): Comment(appMessage('no_comments')));

                /*
                Rezervation calendar
                 */
                template.find('#calendar').flatpickr({
                    inline: true,
                    fullwidth: true,
                    mode: "range",
                    minDate: 'today',
                    maxDate: moment(new Date()).add(1, 'year').format('YYYY-MM-DD'),
                    disable: _.map(advert.unavailable_date, function(t) {
                        return moment(new Date(moment(t.fulldate))).format('YYYY/MM/DD')
                    }),
                    onDayCreate: function(dObj, dStr, fp, dayElem) {
                        if ($(dayElem).hasClass('disabled')) dayElem.innerHTML += "<span class='event unavailable'>Dolu</span>";
                    },
                    onChange: function(selectedDates, dateStr, instance) {
                        App.renderTemplate(template.find('#total_price').html(), {
                            total: selectedDates.length == 2 ?  ((moment(selectedDates[1]).diff(moment(selectedDates[0]), 'days') + 1) * advert.price) : advert.price,
                            day: selectedDates.length,
                            day_price: advert.price
                        })
                            .then((data) => template.zone('total_price').setContentAsync(data));
                    },
                    onReady: function(dateObj, dateStr, instance) {
                        //render price detail default
                        App.renderTemplate(template.find('#total_price').html(), {total: 0,day: 0, day_price: advert.price})
                            .then((data) => template.zone('total_price').setContentAsync(data));

                        //add document clear date event
                        $('.flatpickr-calendar').each(function() {
                            var $this = $(this);
                            document.addEventListener("onDateChange", function(e) {
                                App.promise(() => instance.clear() && instance.close())
                                    .then(() => App.renderTemplate(template.find('#total_price').html(), {total: 0,day: 0, day_price: advert.price}))
                                    .then((data) => template.zone('total_price').setContentAsync(data))
                            });
                        });
                    }
                });

                /*
                Navbar scroll to
                 */
                template.find('.advert-detail-bar h2 a').on('click', (e) => {
                    e.preventDefault();
                    $(e.target).parents('div').first().find('.active').removeClass('active');
                    $(e.target).parent().addClass('active');
                    template.find('#' + $(e.target).attr('data-scroll')).scrollView();
                })

                /*
                Feedback
                 template.find('.feedback-btn').on('click', function(e) {
                            e.preventDefault();
                            FeedbackPopup({
                                template: 'popup-feedback',
                                width: 550,
                                templateData: {
                                    advertId: params.id
                                }
                            })
                        });
                 */

                /*
                Comment
                 template.find('.comment-btn').on('click', function(e) {
                            e.preventDefault();
                            CommentPopup({
                                template: 'popup-comment',
                                width: 550,
                                templateData: {
                                    advertId: params.id
                                }
                            });
                        });
                 */

                /*
                Message
                if (advert.loggin) template.find('.message-btn').on('click', function(e) {
                            e.preventDefault();
                            MessagePopup({
                                template: 'popup-message',
                                width: 550,
                                templateData: {
                                    data: 'dataTemplate'
                                }
                            }, {
                                fullname: advert.user_name + " " + advert.user_lastname,
                                Id: advert.user_id
                            });
                        });
                 */
            })
    })
}