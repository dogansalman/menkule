import Header from '../header';
import Search from './search.handlebars';
import Swiper from 'swiper';
import appMessages from '../../../lib/appMessages';

import infoWindowTemplate from './info.handlebars';
import advertListTemplate from './list.handlebars';
import advertSlideTemplate from './slide.handlebars';
import filter from '../../modal/filter';
import resultFooter from './footer.handlebars';


let advertSlider = null;
let filtered_data = null;
let cordinate = null;
let globalAdverts = null;
let globalTimeoutHandle = null;

export default (params,  query = location.href) => {

    return new Promise((resolve) => {
    Header()
        .then(() => $("body").zone('content').setContentAsync(Search))
        .then((template) => {
            /*
            Add class to body theme
             */
            document.body.classList.add("search-pg");
            /*
            Disable new mark pin.
             */
            template.find("#map").on('pin.map', function(e) {
                e.preventDefault()
            });
            /*
            Search set default text
             */
            template.find('.searchtxt_searchmap').defaultText();

            /*
            Create map set center
             */
            template.find("#map").createMap();
            Gmap.getLatLgn(params.state).then(coords => {
                template.find("#map").centerTo(coords).zoom(12)
            });

            /*
            Get adverts and render
             */
            template.on('re.advrt', function(e) {
                e.preventDefault();
                template.find('#map').clearMarkers();
                /*
                Set default cordi
                 */
                let latlng = Object.assign({
                    lat: location.href.getParameterByName('lat'),
                    lng: location.href.getParameterByName('lng')
                }, latlng || {});

                if (typeof e['cordinates'] != typeof undefined) {
                    if(e['cordinates']) latlng = e['cordinates'];
                    if (e['setcenter']) Gmap.getLatLgn(latlng.name).then(coords => template.find("#map").centerTo(coords).zoom(typeof e['zoom'] != typeof undefined ? parseInt(e['zoom']) : 12));
                }
                Menkule.post('/search', latlng)
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
                            date: moment(query.getParameterByName('checkin')).format('YYYY-MM-DD') + ' - ' + moment(query.getParameterByName('checkout')).format('YYYY-MM-DD'),
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
                        Render advert list & Render result footer
                         */
                        template.zone('advert-list').setContentAsync(advertListTemplate({adverts: adverts}))
                            .then((advertTemple) => {
                                /*
                                 Go detail
                                 */
                                const query = new SearchQuery();
                                delete query.stringfiy;
                                advertTemple.find('.advert-detail-map').on('click', (e) => App.navigate('/advert/' + $(e.target).closest('.advert-detail-map').attr('id'), query, true));

                                /*
                                Hover pan to map
                                 */
                                advertTemple.find('.advert-detail-map').hover((evt) => {
                                    /*
                                    Mouse leave
                                     */
                                    if (String(evt.type) != 'mouseenter' || !$(evt.target).closest('.advert-detail-map')) {
                                        clearTimeout(globalTimeoutHandle);
                                        $(evt.target).closest('.advert-detail-map').removeClass('loading');
                                        globalTimeoutHandle = null;
                                        return;
                                    }
                                    /*
                                    Mouse enter
                                     */
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
                            .then(() => Gmap.getLocationLevelTree(latlng.name || params.state))
                            .then((locations) => template.zone('advert-result-footer').setContentAsync(resultFooter({count: globalAdverts.length, locations: locations})))
                    })
                    .then(() => App.promise(() => globalAdverts.length === 0 ? false : true))
                    .then((has_adverts) => !has_adverts ? reject(): null )
                    .catch(err => {
                        template.zone('advert-list').setContentAsync(appMessages('advert_no_result'))
                            .then(() => App.notifyDanger(appMessages('advert_no_result').clearHtml()))
                            .then(() => template.zone('adverts-slidelist').setContentAsync(''))
                            .then(() => resolve());
                    })
            })

            /*
            Render slide
             */
            template.on('re.slide', function(e) {
                //TODO fix handlebars @index problem
                for (let i = 0; i < e.adverts.length; i++) { e.adverts[i].indx = i}
                template.zone('adverts-slidelist').setContentAsync(advertSlideTemplate({adverts: e.adverts}))
                    .then((slideTemplate) => {

                        const query = new SearchQuery();
                        delete query.stringfiy;
                        slideTemplate.find('.advert-slide-item').on('click', (e) => App.navigate('/advert/' + $(e.target).closest('.advert-slide-item').attr('id'), query, true));
                        /*
                        Slider show/hide
                         */
                        template.find(".advert-slide-down").on('click', (e) => {
                            e.preventDefault();
                            //template.find("#map").toggleClass('fullheight');
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
                .geocomplete({  country: ['tr'], type: ['cities', 'locality', 'political', 'geocode']})
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
                                'lat': String(cordinates.viewport.northeast.lat + '-' + cordinates.viewport.southwest.lat),
                                'lng': String(cordinates.viewport.northeast.lng + '-' + cordinates.viewport.southwest.lng),
                                'name': result.name
                            };
                            var _e = new $.Event('re.advrt');
                            _e['cordinates'] = cordinate;
                            _e['setcenter'] = true;
                            _e['zoom'] = 12;
                            template.trigger(_e);
                        });
                });

            /*
            Get my location
            */
            template.find("button.search-cordi-btn").on('click', (e) => {
                App.showPreloader(.7)
                    .then(() => Gmap.getMyLocation())
                    .then((latlng) => {
                        Gmap.getCityName(latlng.latitude, latlng.longitude)
                            .then((cities) => {
                                Gmap.getLocationViewport(cities.town).then((latlng) => {
                                    var _e = new $.Event('re.advrt');
                                    _e['cordinates'] = {
                                        'lat': String(latlng.viewport.northeast.lat + '-' + latlng.viewport.southwest.lat),
                                        'lng': String(latlng.viewport.northeast.lng + '-' + latlng.viewport.southwest.lng),
                                        'name': cities.town
                                    };
                                    _e['setcenter'] = false;
                                    _e['zoom'] = 12;
                                    template.trigger(_e);
                                })
                            })
                            .then(() => template.find('#map').AddPeopleMarker({
                                lat: latlng.latitude,
                                lng: latlng.longitude
                            }))
                            .then(() => App.promise(() => template.find('#map').centerTo({lat: latlng.latitude, lng: latlng.longitude})))
                            .then(() => App.hidePreloader())
                    })
            })

           /*
           Filter
            */
            template.find('button.advert-search-btn').on('click', (e) => {
                e.preventDefault();
                filter(filtered_data)
                    .then((selected_filter) => {
                        filtered_data = selected_filter;
                        var _e = new $.Event('re.advrt');
                        _e['cordinates'] = cordinate;
                        _e['filter'] = true;
                        template.trigger(_e);
                    })
            });

            /*
                Search text click down/up slide
             */
            App.isMobile().then((mobile) =>  {
                if(!mobile) return;
                template.find(".searchtxt_searchmap").on('click', (e) => {
                    e.preventDefault();
                    //template.find("#map").addClass('fullheight');
                    template.find(".advert-slide-down").addClass('up');
                    template.find('.advert-slide-container').addClass("down");
                });
            })
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
                                'lat': String(latlgn.viewport.northeast.lat + '-' + latlgn.viewport.southwest.lat),
                                'lng': String(latlgn.viewport.northeast.lng + '-' + latlgn.viewport.southwest.lng),
                                'name': cities.town
                            };
                            var _e = new $.Event('re.advrt');
                            _e['cordinates'] = cordinate;
                            _e['setcenter'] = false;
                            template.trigger(_e);
                            $(e.target).enable().removeClass('btn-loading-ico');
                        })
                    })
                    .catch((err) => {
                        App.notifyDanger('Lütfen tekrar deneyin','').then(() => $(e.target).enable().removeClass('btn-loading-ico'));
                    })
            })

           /*
           Select marker info window
            */
            template.find("#map").on('mrk.map', function(e) {
                e.preventDefault();
                /*
                Pan to selected marker
                 */
                var marker = _.find($("#map").getMarkers(), function(obj) {
                    return obj.args.advert_id === e.advert.advert_id
                })
                template.find("#map").panToMarker(marker);

                /*
                Slide to advert
                 */
                advertSlider.slideTo(_.findIndex(globalAdverts, {
                    id: e.advert.advert_id
                }), 300, false);

                /*
                Marker change style
                 */
                $('.marker-selected-advert').removeClass('marker-selected-advert');
                $(e.target).addClass('marker-selected-advert');

                /*
                Open info window
                 */
                App.promise(() => $(".advert-info-window").remove())
                .then(() => globalAdverts.find(a => a.id === e.advert.advert_id))
                .then((advert) => $(marker.div).appenndContentAsync(infoWindowTemplate(advert)))
                .then((infowin) => {
                    const _query = new SearchQuery();
                    /*
                    Go detail
                     */
                    infowin.find('.advert-info-window').on('click', (e) => App.navigate('/advert/' + $(e.target).closest('.advert-detail-map').attr('id') + _query.stringfiy(), true));
                    /*
                    Close
                     */
                    template.find("#map").on('clk.map', (e) => infowin.find('.advert-info-window').remove());
                })
            });
        })
        .catch(err => {
            console.log(err);
            template.zone('advert-list').setContentAsync(appMessages('advert_no_result'))
                .then((data) => App.notifyDanger(data.clearHtml()))
                .then(() => template.zone('adverts-slidelist').setContentAsync(''))
                .then(() => resolve());
        })
        .then(() => resolve());


  })

}



