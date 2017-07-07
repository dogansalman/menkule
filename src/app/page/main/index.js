import template from './main.handlebars';
import Header from '../header';
import Footer from '../footer';

/**
 * Main page
 */
export default () => Header(false)
  .then(() => Footer())
  .then(() => $("body").zone("content").setContentAsync(template()))
  .then(template => new Promise(resolve => {
    /*
    template.find('.searchcity')
      .geocomplete({
        country: ['tr'],
        types: ['(cities)']
      })
      .bind("geocode:result", function(event, result){
        Map.getLocationViewport(result.name).then((locationDetail) => {
          location = Object.assign(locationDetail,{'name':result.name});
        })
      });
    template.find('.searchcity').defaultText();
*/
    //search
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
/*
    //slide
    template.find('.menkule_faq').bxSlider({controls: false});

    //create calendar
    template.find('.calendar').flatpickr(
      {
        mode: 'range',
        minDate: 'today',
        maxDate: moment(new Date()).add(1, 'year').format('YYYY-MM-DD')
      }
    );
    //init player
    //player.onYouTubePlayerAPIReady();
*/
    $('body').addClass('home');
    resolve();
  }));