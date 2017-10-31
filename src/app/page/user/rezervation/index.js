import Header from '../../../page/header';
import Footer from '../../../page/footer';
import Rezervation from './rezervation.handlebars';
import Images from './images.handlebars';
import Fancybox from  '@fancyapps/fancybox';

export default (params) => {
    let rezervation = null;

    return new Promise((resolve) => {
        Header()
            .then(() => Footer())
            .then(() => Menkule.get('/rezervations/' + params.id))
            .do((rez) => rezervation = rez)
            .then((rez) => $('body').zone('content').setContentAsync(Rezervation(rez)))
            .then((template) => {

                /*
                    Render Images
                */
                template.zone('images').setContentAsync(Images({images: rezervation.rezervation_advert.images, price: '250'}))
                    .then(() => App.promise(() => template.find("[data-fancybox]").fancybox({})))
                    .then(() => {
                        template.find('.image-counter').on('click', e => $.fancybox.open($("[data-fancybox]")))
                    });
                /*
                Create map and center
                 */
                template.find("#map").createMap({scroll:true});
                template.find("#map").centerTo({
                    'lat': rezervation.rezervation_advert.advert.latitude,
                    'lng': rezervation.rezervation_advert.advert.longitude
                }).zoom(18).addMarker({
                    'lat': rezervation.rezervation_advert.advert.latitude,
                    'lng': rezervation.rezervation_advert.advert.longitude
                });
                    /*
                  Disable add marker
                   */
                    template.find("#map").on('pin.map', function(e) {
                        e.preventDefault();
                    });

            })
            .then(() => resolve())
            .catch(err => console.log(err))
    })
}
