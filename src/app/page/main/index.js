import template from './main.handlebars';
import Header from '../header';
import Footer from '../footer';
import swiper from 'swiper';
import geocomplate from 'geocomplete';
import flatpickr from "flatpickr"
import Turkish from 'flatpickr/dist/l10n/tr.js';


let location = null;
// Validate config
var searchRules = {
  'state': [App.validate.REQUIRED, App.validate.STRING],
  'date': function (value) {
    return (value != null);
  },
  'guest': [App.validate.REQUIRED, App.validate.NUMBER]
};

/**
 * Main page
 */
export default () => Header(false)
  .then(() => Footer())
  .then(() => $("body").zone("content").setContentAsync(template()))
  .then(template => new Promise(resolve => {

      template.find('.loadingvideo').fadeOut(2000);
    /*
    Inıt geocomplates
     */
    template.find('.searchcity')
      .geocomplete({  country: ['tr'],types: ['(cities)']})
      .bind("geocode:result", function(event, result) {
          Gmap.getLocationViewport(result.name).then((locationDetail) => { location = Object.assign(locationDetail,{'name':result.name})});
      });

    //Is real mobile device
      App.isMobileDevice()
          .then((ismobile) => {
              if(ismobile) {
                  // focus in searchbar
                  template.find('.searchcity-xs').on('focusin', (e) => {
                      template.find('.home-message').addClass('focus-search');
                  });
                  //focusout searchbar
                  $(window).on('click', e => {
                      if (!e.target.closest('.searchcity-xs'))  template.find('.home-message').removeClass('focus-search');
                  });
              }
          });

    template.find('.searchcity-xs')
      .geocomplete({  country: ['tr'],types: ['(cities)']})
      .bind("geocode:result", function(event, result) {
          Gmap.getLocationViewport(result.name).then((locationDetail) => { location = Object.assign(locationDetail,{'name':result.name})});
      });

      /*
      Geocomplate set default text
       */
    template.find('.searchcity').defaultText();
    template.find('.searchcity-xs').defaultText();
   /*
   Search
    */
    template.find('button.seachengine_btn').on('click', (e) => {
      e.preventDefault();
      App.isMobile()
        .then((mobile) => App.promise(() => mobile ? template.find(".search-form-mobile") : template.find(".search-form") )   )
        .then((searchForm) => $(searchForm).validateFormAsync(searchRules))
        .then((formData) =>  {
          App.generateAdvertSearchUrl({
            'checkin': formData.date.split(' - ')[0].trim(),
            'checkout': formData.date.split(' - ')[1].trim(),
            'lat' : location.lat,
            'lng' : location.lng,
            'guest' : formData.guest,
            'name': location.name.turkishToLower()
          })
          .then((searchUrl) => App.navigate(searchUrl.url, searchUrl.query));

        });
    });

    //Initalize Swiper FAQ
      new Swiper('.swiper-container', {
          pagination: '.swiper-pagination',
          mousewheelControl: false,
          spaceBetween: 50,
          autoHeight: false,
          height: 250
      });

      /*
      Inıt calendar
       */
      const calendars = template.find('.calendar');
      flatpickr.localize(flatpickr.l10ns.tr);
      flatpickr(calendars[1],  { mode: 'range', minDate: 'today', dateFormat: 'd/m/Y', maxDate: moment(new Date()).add(1, 'year').format('DD-MM-YYYY') });
      flatpickr(calendars[0],  { mode: 'range', minDate: 'today', dateFormat: 'd/m/Y', maxDate: moment(new Date()).add(1, 'year').format('DD-MM-YYYY') });
      $('body').addClass('home');
    resolve();
  }));