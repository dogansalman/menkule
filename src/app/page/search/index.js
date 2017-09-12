import Header from '../header';
import Footer from '../footer';
import Search from './search.handlebars';
import Swiper from 'swiper';
import appMessages from '../../../lib/appMessages';

import infoWindowTemplate from './info.handlebars';
import advertListTemplate from './list.handlebars';
import advertSlideTemplate from './slide.handlebars';

let advertSlider = null;
let filtered_data = null;
let cordinate = null;
let globalAdverts = null;
let globalTimeoutHandle = null;
export default (params,  query = location.href) => {


    return new Promise((resolve) => {
    Header()
        .then(() => Footer())
        .then(() => $("body").zone('content').setContentAsync(Search))
        .then((template) => {

            //disable new mark pin.
            template.find("#map").on('pin.map', function(e) {
                e.preventDefault()
            });
            //search set default text
            template.find('.searchtxt_searchmap').defaultText();

            /*
            Create map set center
             */
            template.find("#map").createMap();
            Gmap.getLatLgn(params.state).then(coords => {
                template.find("#map").centerTo(coords).zoom(15)
            });


            /*
            Get adverts and render
             */
            template.on('re.advrt', function(e) {
                e.preventDefault();
                template.find('#map').clearMarkers();

                //default cordinate
                latlng = Object.assign({
                    lat: location.href.getParameterByName('lat'),
                    lng: location.href.getParameterByName('lng')
                }, latlng || {});

                //Todo get viewport cordinates
                if (typeof e['cordinates'] != typeof undefined) {
                    var latlng = e['cordinates'];
                    if (e['setcenter']) Gmap.getLatLgn(latlng.name).then(coords => template.find("#map").centerTo(coords).zoom(typeof e['zoom'] != typeof undefined ? parseInt(e['zoom']) : 12));
                    delete latlng.name;
                }

                Menkule.post('/search/advert', latlng)
                    .then((adverts) => {
                        /*
                        Set default filtered_data
                         */
                        filtered_data = Object.assign({
                            advert_type_id: 0,
                            room: 1,
                            beds: 1,
                            visitor: query.getParameterByName('guest'),
                            price: 0,
                            price_type: 0,
                            min_layover: query.getParameterByName('day'),
                            date: moment(query.getParameterByName('checkin')).format('YYYY-MM-DD') + ' to ' + moment(query.getParameterByName('checkout')).format('YYYY-MM-DD'),
                            checkin: query.getParameterByName('checkin'),
                            checkout: query.getParameterByName('checkout')

                        }, filtered_data || {});
                        adverts._advertFilter(filtered_data);

                        /*
                        Add available advert to map marker
                         */
                        _.each(adverts, function (advert, key) {
                            template.find("#map").addAdvertToMap({
                                'lat': advert.latitude,
                                'lng': advert.longitude
                            }, {
                                'advert_id': advert.id,
                                'price': advert.price
                            });
                        });

                        /*
                        Set global advert list filtered adverts
                         */
                        globalAdverts = adverts;

                        /*
                        Render advert list
                         */
                        template.zone('advert-list').setContentAsync(advertListTemplate({adverts: adverts}))
                            .then((advertTemple) => {
                                /*
                                 Go detail
                                 */
                                advertTemple.find('.advert-detail-map').on('click', (e) => App.navigate('/detail/advert/' + $(e.target).closest('.advert-detail-map').attr('id')));

                                /*
                                Hover pan to map
                                 */
                                advertTemple.find('.advert-detail-map').hover((evt) => {
                                    //mouse leave
                                    if (String(evt.type) != 'mouseenter' || !$(evt.target).closest('.advert-detail-map')) {
                                        clearTimeout(globalTimeoutHandle);
                                        $(evt.target).closest('.advert-detail-map').removeClass('loading');
                                        globalTimeoutHandle = null;
                                        return;
                                    }
                                    //mouse enter
                                    $(evt.target).closest('.advert-detail-map').toggleClass('loading');
                                    globalTimeoutHandle = setTimeout(function () {
                                        App.promise(() => $(evt.target).closest('.advert-detail-map').removeClass('loading'))
                                            .then(() => App.promise(() => $(evt.target).closest('.advert-detail-map').attr('id')))
                                            .then((advert_id) => App.promise(() => $("#map").getMarkers().findIndex(cm => cm.args.advert_id == advert_id)))
                                            .then((advertIndex) => {
                                                template.find('.marker-selected-advert').removeClass('marker-selected-advert');
                                                $(template.find("#map").getMarkers()[advertIndex].div).addClass('marker-selected-advert');
                                                template.find("#map").panToMarker(template.find("#map").getMarkers()[advertIndex]);
                                            })
                                            .then(() => App.promise(() => template.find('.advert-info-window').remove()))
                                    }, 500);
                                });
                            })
                            .then(() => App.promise(() =>  new $.Event('re.slide', {adverts: adverts})))
                            .then((_e) => template.trigger(_e))
                    })
            })

            /*
            Render slide
             */
            template.on('re.slide', function(e) {
                //TODO fix handlebars @index problem
                for (let i = 0; i < e.adverts.length; i++) { e.adverts[i].indx = i}
                template.zone('adverts-slidelist').setContentAsync(advertSlideTemplate({adverts: e.adverts}))
                    .then(() => {
                        /*
                        Slider show/hide
                         */
                        template.find(".advert-slide-down").on('click', (e) => {
                            e.preventDefault();
                            template.find("#map").toggleClass('fullheight');
                            $(e.target).toggleClass('up');
                            $(e.target).parents('.advert-slide-container').toggleClass("down");
                        });

                        /*
                        Inıt slider
                         */
                        advertSlider = new Swiper('.swiper-container', {
                            initialSlide: 0,
                            pagination: '.swiper-pagination',
                            slidesPerView: 1.1,
                            slidesPerGroup: 1,
                            paginationClickable: false,
                            centeredSlides: true,
                            spaceBetween: 5,
                            onInit: function(e) {
                                e.update(true);
                                e.slideTo(0, 0);
                            },
                            onSlideChangeStart: function(e) {
                                $('.marker-selected-advert').removeClass('marker-selected-advert');
                                $(template.find("#map").getMarkers()[$(e.slides[e.activeIndex]).attr("data-index")].div).addClass('marker-selected-advert');
                                template.find("#map").panToMarker(template.find("#map").getMarkers()[$(e.slides[e.activeIndex]).attr("data-index")]);
                            }
                        });
                    })
            });


           /*
           Trigger event render
            */
            var _e = new $.Event('re.advrt');
            template.trigger(_e);
            template.find('.searchtxt_searchmap')
                .geocomplete({
                    country: ['tr'],
                    types: ['(cities)']
                })
                .bind("geocode:result", function(event, result) {
                    Gmap.getLocationViewport(result.name).then((locationDetail) => {
                        return App.promise(function() {
                            return Object.assign(locationDetail, {
                                'name': result.name
                            })
                        });
                    })
                        .then((cordinates) => {
                            cordinate = {
                                'lat': String(cordinates.lat),
                                'lng': String(cordinates.lng),
                                'name': result.name
                            };
                            var _e = new $.Event('re.advrt');
                            _e['cordinates'] = cordinate;
                            _e['setcenter'] = true;
                            _e['zoom'] = 15;
                            template.trigger(_e);
                        });
                });



            /*
            Get my location
            */
            template.find("button.search-cordi-btn").on('click', (e) => {
                App.showPreloader(.7)
                    .then((latlng) => Gmap.getMyLocation())
                    .then((latlng) => {
                        Gmap.getCityName(latlng.latitude, latlng.longitude)
                            .then((cities) => {
                                Gmap.getLocationViewport(cities.town).then((latlgn) => {
                                    var _e = new $.Event('re.advrt');
                                    _e['cordinates'] = {
                                        'lat': String(latlgn.lat),
                                        'lng': String(latlgn.lng),
                                        'name': cities.town
                                    };
                                    _e['setcenter'] = true;
                                    _e['zoom'] = 15;
                                    template.trigger(_e);
                                })
                            })
                            .then(() => template.find('#map').AddPeopleMarker({
                                lat: latlng.latitude,
                                lng: latlng.longitude
                            }))
                            .then(() => App.hidePreloader())
                    })
            })



            //other filter
            /*
            template.find('button.advert-search-btn').on('click', (e) => {
                e.preventDefault();
                FilterPopup({
                    template: 'popup-search-filter',
                    width: 450,
                    templateData: {}
                }, filtered_data)
                    .then((selected_filter) => {
                        filtered_data = selected_filter;
                        var _e = new $.Event('re.advrt');
                        _e['cordinates'] = cordinate;
                        _e['filter'] = true;
                        template.trigger(_e);
                    })
            });
             */


            /*
                Search text click down/up slide
             */
            template.find(".searchtxt_searchmap").on('click', (e) => {
                e.preventDefault();
                template.find("#map").addClass('fullheight');
                template.find(".advert-slide-down").addClass('up');
                template.find('.advert-slide-container').addClass("down");
            });


            /*
                Refresh search
             */
             template.find("button.search-refresh-btn").on('click', (e) => {
                $(e.target).disable().addClass('btn-loading-ico');
                var centerCordinate = template.find("#map").getMapCenterCordinate();
                Gmap.getCityName(centerCordinate.lat(), centerCordinate.lng())
                    .then((cities) => {
                        Gmap.getLocationViewport(cities.town).then((latlgn) => {
                            cordinate = {
                                'lat': String(latlgn.lat),
                                'lng': String(latlgn.lng),
                                'name': cities.town
                            };
                            var _e = new $.Event('re.advrt');
                            _e['cordinates'] = cordinate;
                            _e['setcenter'] = false;
                            template.trigger(_e);
                            $(e.target).enable().removeClass('btn-loading-ico');
                        })
                    })
            })



           /*
           Select marker info window
            */
            template.find("#map").on('mrk.map', function(e) {
                e.preventDefault();
                //Pan to selected marker
                var marker = _.find($("#map").getMarkers(), function(obj) {
                    return obj.args.advert_id === e.advert.advert_id
                })
                template.find("#map").panToMarker(marker);

                //slide go to selected advert
                advertSlider.slideTo(_.findIndex(globalAdverts, {
                    id: e.advert.advert_id
                }), 300, false);

                //selected advert marker change style
                $('.marker-selected-advert').removeClass('marker-selected-advert');
                $(e.target).addClass('marker-selected-advert');

                //selected advert info window
                App.promise(() => $(".advert-info-window").remove())
                .then(() => globalAdverts.find(a => a.id === e.advert.advert_id))
                .then((advert) => $(marker.div).appenndContentAsync(infoWindowTemplate(advert)))
                .then((infowin) => {
                    //click to detail on info window
                    infowin.find('.advert-info-window').on('click', (e) => App.navigate('/detail/advert/' + $(e.target).closest('.advert-detail-map').attr('id')));
                    //map click remove info window
                    template.find("#map").on('clk.map', (e) => infowin.find('.advert-info-window').remove());
                })
            });



        })
        .then(() => resolve())
        .catch(err => {
            console.log(err);
            //no advert result
            App.renderTemplate(appMessages('advert_no_result'))
                .then((data) => {
                   // template.zone('advert-list').setContentAsync(data);
                    App.notifyDanger(data.clearHtml());
                })
           //     .then((data) => template.zone('adverts-slidelist').setContentAsync(''))
                .then(() => resolve());
        })
  })

}



