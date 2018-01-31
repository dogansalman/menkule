import modal from '../modal';
import filter from './filter.handlebars';
///import flatpickr from 'flatpickr';


/*
Filter form validate
 */
const filterFormRules = {
    'advert_type_id': [App.validate.NUMBER],
    'visitor': [App.validate.NUMBER],
    'beds': [App.validate.NUMBER],
    'room': [App.validate.NUMBER],
    'price_type': [App.validate.NUMBER]
};


export default(filtered_data) => {

    /*
    Filter options
     */
    filtered_data = Object.assign({
        advert_type_id: 0,
        room: 0,
        beds: 0,
        visitor: 0,
        price: null,
        price_type: 0,
        date: '',

    }, filtered_data || {});

    return new Promise((resolve) => {
        modal({template: filter(filtered_data), width:450, title: 'Filtre'})
            .then((template) => {
                /*
                Get opened modal
                 */
                const openedModal = template.parents('.modal');

                /*
                Counter
                 */

                //room bed visitor filter
                template.find('#room').handleCounter({maximize: 7});
                template.find('#beds').handleCounter({maximize: 7});
                template.find('#visitor').handleCounter({maximize: 15});

                /*
                Advert types
                 */
                template.zone('adverttypes')
                    .applyRemote('/advert/types', {
                        resolve: "types",
                        wait: false,
                        loadingText: "Lütfen bekleyin.",
                        extraData: {
                            advert_type_id: filtered_data.advert_type_id || 0
                        }
                    });

                /*
                Inıt calendar
                 */
                flatpickr.localize(flatpickr.l10ns.tr);
                flatpickr(template.find('.calendar')[0],
                    {
                        mode: 'range',
                        minDate: 'today',
                        static: true,
                        maxDate: moment(new Date()).add(1, 'year').format('YYYY-MM-DD'),
                        defaultDate: [filtered_data.checkin, filtered_data.checkout]
                    });
                /*
                Filter
                 */
                template.find('.acceptbtn').on('click', (e) => {
                    e.preventDefault();
                    template.find(".filter-container").validateFormAsync(filterFormRules)
                        .then((filters) => {
                            Object.assign(filters, {'checkin': filters.date.split(' - ')[0].trim(),'checkout': filters.date.split(' - ')[1].trim() } )
                            openedModal.modal('hide');
                            resolve(filters);
                        });
                });

            })
    })
}