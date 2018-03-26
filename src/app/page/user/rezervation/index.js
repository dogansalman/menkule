import Header from '../../../page/header';
import Footer from '../../../page/footer';
import Rezervation from './rezervation.handlebars';
import Images from './images.handlebars';
import Fancybox from  '@fancyapps/fancybox';
import Message from '../../../modal/message';
import Confirm from '../../../modal/confirm';
import AppMessages  from '../../../../lib/appMessages';
import ConfirmRezervations from './confirmRezervation.handlebars'

export default (params) => {
    let rezervation = null;
    return new Promise((resolve) => {
        Header()
            .then(() => Footer())
            .then(() => Menkule.get('/rezervations/' + params.id))
            .then((rez) => rezervation = rez)
            .then(() => rezervation.updated_date = rezervation.updated_date == null ? false : true)
            .then(() => $('body').zone('content').setContentAsync(Rezervation(rezervation)))
            .then((template) => {
                // Message
                template.find('.message').on('click', function(e) {
                    e.preventDefault();
                    Message({
                        fullname: rezervation.user_information.fullname,
                        Id: rezervation.user_information.id
                    });
                });
                // Approved rezervation
                template.find('.acceptbtn').on('click', function(e) {
                    let modal;
                    e.preventDefault();
                    Confirm({message: AppMessages ('rezervation_approved_confirm'), title: AppMessages('rezervation_approved_title')}).do(m => modal = m)
                        .then(() => Menkule.get('/rezervations/approve/' + rezervation.id))
                        .then(() => App.notifySuccess('Rezervasyon onaylandı!',''))
                        .then(() => Rezervation(params))
                        .then(() => modal.modal('hide'))
                        .catch((err) => {
                            if(err.status === 501) {
                                const rezervationConfirmMessage = ConfirmRezervations({rezervations: err.responseJSON});
                                    App.promise(() => modal.modal('hide'))
                                    .then(() => Confirm({title: 'Önemli Uyarı', message: rezervationConfirmMessage}))
                                    .then(() => console.log('send'))
                            } else {
                                App.notifyDanger(err.responseJSON.Message, '')
                                    .then(() => modal.modal('hide'))
                            }

                        })
                });
                // Cancel rezervation
                template.find('.cancelbtn').on('click', function(e) {
                    let modal;
                    e.preventDefault();
                    Confirm({message: AppMessages ('rezervation_cancel_confirm'), title: AppMessages('rezervation_cancel_title')}).do(m => modal = m)
                        .then(() => Menkule.get('/rezervations/cancel/' + rezervation.id))
                        .then(() => App.notifySuccess('Rezervasyon iptal edildi!',''))
                        .then(() => Rezervation(params))
                        .then(() => modal.modal('hide'))
                        .catch((err) => {
                            App.notifyDanger(err.responseJSON.Message, 'Üzgünüz')
                                .then(() => modal.modal('hide'))
                        })
                });
                // Render Images
                template.zone('images').setContentAsync(Images({images: rezervation.rezervation_advert.images, price: '250'}))
                    .then(() => App.promise(() => template.find("[data-fancybox]").fancybox( { buttons : ['close']})))
                    .then(() => {
                        template.find('.image-counter').on('click', e => $.fancybox.open($("[data-fancybox]"), { buttons : ['close']}))
                    });
                // Create map and center
                template.find("#map").createMap({scroll:true});
                template.find("#map").centerTo({
                    'lat': rezervation.rezervation_advert.advert.latitude,
                    'lng': rezervation.rezervation_advert.advert.longitude
                }).zoom(18).addMarker({
                    'lat': rezervation.rezervation_advert.advert.latitude,
                    'lng': rezervation.rezervation_advert.advert.longitude
                });
                // Disable add marker
                template.find("#map").on('pin.map', function(e) {
                    e.preventDefault();
                });
            })
            .then(() => resolve())
            .catch(err => console.log(err))
    })
}



