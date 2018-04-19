import modal from '../../components/modal';
import rezervationForm from './rezervation-form.handlebars';
import flatpickr from "flatpickr"
import Turkish from 'flatpickr/dist/l10n/tr.js';

export default () => {
    var shareFormValidation = {
        share_gsm: [],
        share_email: [],
    };

    modal({template: rezervationForm, title: 'Yeni Rezervasyon', width: 650})
        .then((template) => {

            // Init Calendar
            flatpickr.localize(flatpickr.l10ns.tr);
            flatpickr(template.find('.calendar')[0],
                {
                    mode: 'range',
                    minDate: 'today',
                    static: true,
                    dateFormat: 'd/m/Y',
                    maxDate: moment(new Date()).add(1, 'year').format('YYYY-MM-DD'),
                    onChange: (e) => {
                        if(e.length === 2 && moment(new Date(moment(e[0])._d)).format('DD-MM-YYYY') == moment(new Date(moment(e[1])._d)).format('DD-MM-YYYY')) {
                            template.find('.calendar')[0].value = "";
                        }
                    }
                });

            // Share Selection
            template.formFields('share_email').on('change', (e) => {
                if($(e.target).is(':checked')) return template.formFields('email').show();
                template.formFields('email').hide();
            });
        });
}