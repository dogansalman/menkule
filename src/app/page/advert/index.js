import Footer from '../footer';
import Header from '../header';
import Fancybox from  '@fancyapps/fancybox';
import appMessage from '../../../lib/appMessages';
import Advert from './advert.handlebars';
import Comments from './comment.handlebars';
import Price from './price.handlebars';
import Images from './images.handlebars';
import Feedback from '../../popup/feedback';
import Message from '../../popup/message';
import Comment from '../../popup/comment';
import _Advert from '../advert';
import flatpickr from 'flatpickr';
import Turkish from 'flatpickr/dist/l10n/tr';

export default (params) => {
    /*
    Rezervation rules
     */
    const rezervationRules = {
        'date': function (value) {
            if(!value || value.split(' - ').length < 2) return false;
            return true;
        }
    };


    return new Promise((resolve) => {
        /*
        Advert
         */
        let advert = {};

        Header()
            .then(() => Footer())
            .then(() => Menkule.get('/adverts/find/' + params.id))
            .do(a => advert = a)
            .do(() =>  Object.assign(advert, {loggin: Menkule.hasToken()}))
            .then((advert) => $("body").zone('content').setContentAsync(Advert(advert)))
            .then((template) => {


                /*
                Inıt Gmap
                 */
                template.find("#map").createMap({scroll: true});
                template.find("#map").centerTo({
                    'lat': advert.advert.latitude,
                    'lng': advert.advert.longitude
                }).zoom(15).addMarker({
                    lat: advert.advert.latitude,
                    lng: advert.advert.longitude
                })

                /*
                Disable add marker
                 */
                template.find("#map").on('pin.map', function(e) {
                    e.preventDefault();
                });

                /*
                Render comments
                 */
                template.zone('comments').setContentAsync( advert.comments.length > 0 ? Comments({comments: advert.comments}): Comments(appMessage('no_comments')));

                /*
                Render Images
                 */
                template.zone('images').setContentAsync(Images({images: advert.images, price: '250'}))
                .then(() => App.promise(() => template.find("[data-fancybox]").fancybox({ buttons : ['close']})))
                .then(() => {
                    template.find('.image-counter').on('click', e => $.fancybox.open($("[data-fancybox]"), { buttons : ['close']}));
                });



                /*
                Inıt Calendar
                 */
                flatpickr.localize(flatpickr.l10ns.tr);
                flatpickr(template.find('#calendar')[0], {
                    inline: true,
                    fullwidth: true,
                    mode: "range",
                    minDate: 'today',
                    maxDate: moment(new Date()).add(1, 'year').format('YYYY-MM-DD'),
                    disable: _.map(advert.unavailable_date, function(t) {
                        return moment(new Date(moment(t.fulldate))).format('YYYY/MM/DD')
                    }),
                    onDayCreate: function(dObj, dStr, fp, dayElem) {
                        if ($(dayElem).hasClass('disabled')) dayElem.innerHTML += "<span class='event unavailable'></span>";
                    },
                    onChange: function(selectedDates, dateStr, instance) {
                        template.zone('total_price').setContentAsync(Price({ total: selectedDates.length == 2 ? ((moment(selectedDates[1]).diff(moment(selectedDates[0]), 'days') + 1) * advert.advert.price) : advert.advert.price, day: selectedDates.length, day_price: advert.advert.price }));
                    },
                    onReady: function(dateObj, dateStr, instance) {
                        //render price detail default
                        template.zone('total_price').setContentAsync(Price({total: 0,day: 0, day_price: advert.advert.price}))

                        //add document clear date event
                        $('.flatpickr-calendar').each(function() {
                            var $this = $(this);
                            document.addEventListener("onDateChange", function(e) {
                                App.promise(() => instance.clear() && instance.close())
                                    .then((data) => template.zone('total_price').setContentAsync(Price({total: 0,day: 0, day_price: advert.advert.price})))
                            });
                        });
                    }
                });



                /*
                Rezervation
                 */
                template.find('.rez-create').on('click', e => {
                    App.isMobile()
                        .then((mbl) => {
                            var dateValue = template.find('#calendar').val();
                            if(mbl && !dateValue || dateValue.split(' - ').length < 2){
                                template.find('.rezervation-form').addClass('open');
                                $('body').addClass("open-calendar");
                            }
                        })
                    template.find('.rezervation-form').validateFormAsync(rezervationRules)
                        .then((d) =>  {
                            var checkin = d.date.split(' - ')[0].trim();
                            var checkout =  d.date.split(' - ')[1].trim();
                            var days =  moment(checkout).diff(moment(checkin),'days')+1
                            var total = advert.advert.price * days
                            App.navigate('/rezervation/' + params.id, {'checkin':checkin, 'checkout':checkout, 'days':days, 'total': total});
                        })
                        .catch((e) =>
                            {
                                console.log(e);
                                App.isMobile().then((mbl) => { if(!mbl) App.notifyDanger('Rezervasyon tarihini seçin.', '') })
                            }
                        );
                })

                //close calendar btn
                template.find('.close-calendar').on('click', e => {
                    $('body').removeClass('open-calendar');
                    template.find('.rezervation-form').removeClass('open');
                    document.dispatchEvent(new CustomEvent("onDateChange"))

                });
                /*
                Mobile rezervation focusout
                 */
                $(window).on('click', e => {
                    if (!e.target.closest('.rezervation-form')) $('body').removeClass('open-calendar') &&
                    template.find('.rezervation-form').removeClass('open');
                    App.isMobile().then((mbl) => { if(mbl) document.dispatchEvent(new CustomEvent("onDateChange")) })
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
                Add score
                 */
                template.find('.advert-star a').on('click', function(e) {
                    var _score;
                    e.preventDefault()
                    App.promise(() => $(e.target).attr('data-score'))
                        .do(s => _score = s)
                        .then((dataScore) => Menkule.post("/advert/add/score", {
                            advert_id: params.id,
                            score: dataScore
                        }))
                        .then(() => App.notifySuccess('Değerlendirme puanınız uygulandı.', 'Teşekkürler.'))
                        .then(() => App.promise(() => template.zone('currentscore').setContentAsync('(' + String(parseInt(_score) + parseInt(advert.advert.score)) + ')')))
                        .catch((err) => {
                            if (err.status == 401) App.notifyDanger('Lütfen oturum açın.', 'Teşekkürler.');
                            else App.notifyDanger('Değerlendirme sadece bir kere uygulanabilir.', 'Üzgünüz.');
                        });
                });


                /*
                Feedback
                 */
                template.find('.feedback-btn').on('click', function(e) {
                  e.preventDefault();
                  Feedback({id: advert.advert.id});
                });

                /*
                Comment
                 */
                template.find('.comment-btn').on('click', function(e) {
                  e.preventDefault();
                  Comment({id: advert.advert.id});
                  });

                /*
                Message
                 */
                template.find('.message-btn').on('click', function(e) {
                  e.preventDefault();
                  Message({
                    fullname: advert.user.fullname,
                    Id: advert.user.id
                  });
                });
            })
            .then(() => resolve())

        /*
       When user logged
        */
        App.on('logged.user', (user) => {
            if(advert.advert.id) _Advert({id: advert.advert.id});
        });
    })
}



