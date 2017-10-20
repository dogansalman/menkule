import Header from '../../header';
import Footer from '../../footer';
import uploader from '../../../../lib/uploader';
import Confirm from '../../../popup/confirm';
import templatee from './advert.handlebars';
import avaiableDates from './availableDate.handlebars';
import calendar from '../../../popup/calendar';

/*
Validate
 */
var advertRules = {
  'advert_type_id': [App.validate.REQUIRED, App.validate.NUMBER],
  'adress': [App.validate.REQUIRED, App.validate.STRING],
  'description': [App.validate.REQUIRED, App.validate.STRING],
  'title': [App.validate.REQUIRED, App.validate.STRING],
  'city_id': [App.validate.REQUIRED, App.validate.NUMBER],
  'town_id': [App.validate.REQUIRED, App.validate.NUMBER],
  'm2': [App.validate.REQUIRED, App.validate.NUMBER],
  'visitor': [App.validate.REQUIRED, App.validate.NUMBER],
  'bathroom': [App.validate.REQUIRED, App.validate.NUMBER],
  'beds': [App.validate.REQUIRED, App.validate.NUMBER],
  'build_age': [App.validate.REQUIRED, App.validate.NUMBER],
  'floor': [App.validate.REQUIRED, App.validate.NUMBER],
  'room': [App.validate.REQUIRED, App.validate.NUMBER],
  'price': [App.validate.REQUIRED, App.validate.PRICE],
  'hall': [App.validate.REQUIRED, App.validate.NUMBER],
  'group': [
      {
          name: 'properties',
          elements: ['visitor', 'bathroom', 'm2', 'beds', 'bedroom', 'build_age', 'floor', 'room', 'hall']
      },
      {
          name: 'possibility',
          elements: ['internet', 'air', 'tv', 'requiments', 'heat', 'kitchen', 'gym', 'elevator', 'jacuzzi', 'smoke', 'pet']
      }
  ],
  'map': function(value) {
    return (value != null);
  },
  'photos': function(value) {
    return (value != null && value.filter(i => !i.deleted).length > 0 );
  }
};

/*
  Advert detail
 */
let advert;
/*
 Template
 */
let template = null;
/*
Avaiable date list
 */
let dateList = [];

export default (params) => {

  return new Promise((resolve) => {
    Header()
      .then(() => Footer())
      .if((params), () => Menkule.get("/adverts/" + params.id).do(a => advert = a))
      .then(() => $("body").zone('content').setContentAsync(templatee(advert)).do(t => template = t))
      .then(() => template.find("#map").createMap({scroll:true}))
      .then(() => {

          /*
     Render avaiable dates
      */
          $("body").zone('dateselect-container')[0].addEventListener("selected.date", function(e) {
              $("body").zone('dateselect-container').setContentAsync( avaiableDates({dates: e.detail}))
                  .then((listTemplate) => {
                      /*
                      Delete date
                       */
                      listTemplate.find(".deletedatebtn").on('click', (e) => {
                          e.preventDefault();
                          var index = parseInt($(e.target).attr('data-index'), 10);
                          dateList.splice(index, 1);
                          $(e.target).closest('.datecontainer').remove();
                      });
                  });
          });

          /*
           Advert exists
           */
          if(advert) {
              /*
               Notify advert state
              */
              if (advert.advert.state) App.notifyDanger('İlanınız onay için incelenmektedir.', 'Onay Bekleniyor');


              /*
               Advert avaiable date add to list
              */
              advert.available_date.forEach(function(date, index) {
                  dateList.push(new DateRange(moment(date.from_date), moment(date.to_date)));
              });
              $("body").zone('dateselect-container')[0].dispatchEvent((new CustomEvent('selected.date', { detail: dateList})));

              /*
               Set center latitude longitude
              */
              template.find("#map").centerTo({
                  'lat': advert.advert.latitude,
                  'lng': advert.advert.longitude
              }).zoom(advert.advert.zoom).addMarker({
                  'lat': advert.advert.latitude,
                  'lng': advert.advert.longitude
              });
          }

        /*
        Add avaiable dates
         */
        template.find('.daterangebtn').on('click', (e) => {
            calendar()
                .then((dateRange) => App.promise(() =>  dateList.push(dateRange)))
                //TODO fix dispatchEvent console error.
                .then(() => App.promise(() => $("body").zone('dateselect-container')[0].dispatchEvent((new CustomEvent('selected.date', { detail: dateList})))))
        });

        /*
          Get my location select city and town
           */
        template.find("button.search-cordi-btn").on('click', (e) => {
          App.showPreloader(.7)
            .then((latlng) => Gmap.getMyLocation())
            .then((latlng) => {
              Gmap.getCityName(latlng.latitude, latlng.longitude)
                .then((cities) => App.promise(() => {
                  App.promise(() => template.find(".cities").val(template.find(".cities option").filter(function() {
                    return $(this).html().toLowerCase() == cities.city.toLowerCase();
                  }).val()))
                    .then(() => App.promise(() => template.find(".cities").trigger("change", new Event('change'))))
                    .then(() => App.wait(500))
                    .then(() => template.find(".towns").val(template.find(".towns option").filter(function() {
                      return $(this).html().toLowerCase() == cities.town.toLowerCase();
                    }).val()))
                    .then(() => App.promise(() => template.find(".towns").trigger("change", new Event('change'))))
                }))
                .then(() => App.promise(() => template.find("#map").clearMarkers()))
                .then(() => App.promise(() => template.find('#map').addMarker({lat: latlng.latitude,lng: latlng.longitude})))
                .then(() => App.promise(() => template.find("#map").panToMarker(template.find("#map").getMarkers()[0])))
                .then(() => App.promise(() => template.find("#map").zoom(16)))
                .then(() => App.hidePreloader())
            })
            .catch((err) => {
              App.hidePreloader()
                .then(() => App.notifyDanger('', 'Beklenmeyen bir hata oluştu veya lokasyonunuz bulunamadı.'))
            })
        })

        /*
        Create uploader
         */
        template.find('.uploader').createUploader(advert && advert.images != null ? advert.images : null);

        //check marker location
        template.find("#map").on('pin.map', function(e) {
          e.preventDefault();
          Gmap.getCityName(e.location.lat(), e.location.lng())
            .then((cities) => {
              if(template.find(".towns option:selected").text().toLowerCase() == cities.town.toLowerCase()) {
                $(e.target).clearMarkers();
                template.find('#map').addMarker({lat: e.location.lat(),lng: e.location.lng()});
              } else {
                App.notifyDanger('Seçtiğiniz il/ilçe dışında bir lokasyon tanımlamaya çalıştınız.', 'Üzgünüz');
              }
            })
        });
          
        /*
        Advert types
         */
        $("body").zone('adverttypes')
         .applyRemote('/advert/types', {
            resolve: "types",
            wait: false,
            loadingText: "Lütfen bekleyin.",
            extraData: {
              advert_type_id: advert ? advert.advert_type.id : 0
            }
          });

        /*
           City & town selector
          */
        template.formFields('town_id')
         .disable()
         .on('rendered.template', (e) => $(e.target).enable().trigger("change", e))
         .applyRemote('/cities', {
            resolve: "towns",
            wait: true,
            loadingText: "<option>İl seçiniz</option>",
            extraData: {
              townId: advert ? advert.town.id : 0
            }
          });

        template.formFields('city_id')
          .on("change", (e, firstLoad) => {
            if (e.target.value)
              template.formFields('town_id').disable().applyRemote("refresh", {
                get: {},
                urlPar: e.target.value,
                url: '/cities/' + e.target.value,
                loadingText: "<option>Lütfen bekleyin</option>"
              });
            else
              template.formFields('town_id').disable().applyRemote("reset", {
                loadingText: "<option>İl seçiniz</option>"
              });
          })
          .on('rendered.template', (e) => $(e.target).trigger("change", e))
          .applyRemote('/cities', {
            resolve: "cities",
            extraData: {
              cityId: advert ? advert.city.id : 0
            }
          });

        /*
        Change map on town select
        */
        template.formFields('town_id').on("change", (e, a) => {
          if (a && advert) return;
          var city = template.formFields('city_id')[0].value ? template.formFields('city_id')[0].selectedOptions.item(0).text : "Türkiye";
          if (city != "Türkiye" && e.target.value) city = city + " " + e.target.selectedOptions.item(0).text;
          var zoom = (city == "Türkiye") ? 6 : (e.target.value ? 15 : 10);
          Gmap.getLatLgn(city).then(coords => template.find("#map").centerTo(coords).zoom(zoom));
        });

        /*
       Update or Create
        */
        template.find('button.update').on('click', (e) => {
          e.preventDefault();
          $(e.target).disable();
          $(".advert-detail").formFields().disable();
          template.find(".advert-detail").validateFormAsync(advertRules)
            .then((advert) => App.showPreloader(advert, .7))
            .then((advert) => {
              const advertData = uploader.getImages() == null ? _.omit(Object.assign(advert, advert.map[0], {
                    'available_date': dateList
              }), ['map', 'marker', 'toVal']) : Object.assign(_.omit(Object.assign(advert, advert.map[0]), ['map', 'marker', 'toVal']), {
                    'images': uploader.getImages()
              }, {
                    'available_date': dateList
              });

              Menkule.request((advert.id ? 'PUT' : 'POST'), '/adverts' + (advert.id ? '/' + advert.id : ''), advertData, 'application/json;charset=utf-8')
                .then(() => App.hidePreloader())
                .then(() => {
                  App.notifySuccess('İlanınız kaydedildi.', 'Tamam');
                  $(e.target).enable();
                  $(".advert-detail").formFields().enable();
                  if (!advert.id) App.wait(2000).then(() => App.navigate('/user/adverts'));
                });
            })
            .catch((err) => {
                $(e.target).enable();
                $(".advert-detail").formFields().enable();
                if (err instanceof ValidateError) {
                  if (err.fields[0].id == "map") return App.notifyDanger('lütfen ilanınızın konumunu işaretleyin.', 'Üzgünüz');
                  if(err.fields[0].hasAttribute('data-form-element')) return App.notifyDanger('İlanınızın yayınlanabilmesi için lütfen en az <b>6</b> görsel yükleyin.', 'Üzgünüz');
                  return App.hidePreloader().then(() => $(err.fields[0]).focus());
                }
                if (err instanceof Error) return App.hidePreloader().then(() => App.notifyDanger(err.message));
                App.hidePreloader()
                  .then(() => App.parseJSON(err.responseText))
                  .then(o => App.notifyDanger(o.result || o.message, 'Üzgünüz'))
                  .catch(o => App.notifyDanger(o, 'Beklenmeyen bir hata'));
          });
        });

        /*
       Delete
        */
        template.find('button.delete').on('click', (e) => {
          Confirm({
            message: 'İlan kaydını silmek istediğinize emin misiniz ?',
            title: 'Emin misiniz ?'
          })
            .then(() => {
              App.showPreloader(.7)
                .then(() => Menkule.delete('/adverts/' + advert.advert.id))
                .then(() => App.hidePreloader())
                .then(() => App.notifySuccess('İlan kaydınız silindi.', 'Tamam'))
                .then(() => App.wait(1500))
                .then(() => App.navigate('/user/adverts'))
                .catch((err) => {
                  App.parseJSON(err.responseText)
                    .then(o => App.notifyDanger(o.result || o.message, 'Üzgünüz'))
                    .catch(o => App.notifyDanger(o, 'Beklenmeyen bir hata'));
                })
            });
        });
      })
      .then(() => resolve())
  })

}