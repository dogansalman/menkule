import modal from '../../components/modal';
import rezervationForm from './rezervation-form.handlebars';
import flatpickr from "flatpickr"
import Turkish from 'flatpickr/dist/l10n/tr.js';
import advertPrice from './advert-price.handlebars';

export default (advert) => {

    let template;
    const shareFormValidation = {
        share_gsm: [],
        share_email: [],
    };
    const rezervationFormRules = {
        'name': [App.validate.REQUIRED, App.validate.STRING],
        'lastname': [App.validate.REQUIRED, App.validate.STRING],
        'email': [App.validate.REQUIRED, App.validate.EMAIL],
        'note': [App.validate.STRING],
        'gsm': [App.validate.REQUIRED, App.validate.PHONE],
        'identity_no': [App.validate.REQUIRED, App.validate.NUMBER, App.validate.BETWEEN(10, 12)],
        'gender': [App.validate.REQUIRED, function (value, fields) {
            return ($(fields['gender']).fieldValue() === 'Bayan' || $(fields['gender']).fieldValue() == 'Bay');
        }],
        'accept_policy': function(value) {
            if (value !== true) {
                App.notifyDanger('Devam etmek için Üyelik Koşulları ve Ön Bilgilendirme formunu onaylamanız gerekmektedir.', 'Üzgünüz');
            }
            return value;
        }
    };
    function renderAdvertPrice(params){
        return new Promise((resolve) => template.zone('price-table').setContentAsync(advertPrice(params)).then(() => resolve()));
    }
    function InitCalendar(){
        return new Promise((resolve) => {
            let enabledDates = [];
            if(advert.available_date.length > 0) {
                advert.available_date.forEach(d => {
                    getDateRange(d.from_date, d.to_date, 'YYYY-MM-DD').forEach(dt => enabledDates.push((dt)));
                });
            }
            // Init Calendar
            flatpickr.localize(flatpickr.l10ns.tr);
            flatpickr(template.find('.calendar')[0],
                {
                    mode: 'range',
                    minDate: 'today',
                    static: true,
                    dateFormat: 'd/m/Y',
                    enable:enabledDates,
                    disable: advert.unavailable_date.map(t => moment(new Date(moment(t.fulldate)._d)).format('YYYY-MM-DD')),
                    maxDate: moment(new Date()).add(1, 'year').format('YYYY-MM-DD'),
                    onChange: (selectedDates, dateStr, instance) => {
                        if(selectedDates.length === 2 && moment(new Date(moment(selectedDates[0])._d)).format('DD-MM-YYYY') == moment(new Date(moment(selectedDates[1])._d)).format('DD-MM-YYYY')) {
                            template.find('.calendar')[0].value = "";
                        }
                        if(selectedDates.length == 2 && moment(new Date(selectedDates[1])) != moment(new Date(selectedDates[0]))) {
                            renderAdvertPrice({
                                total: ((moment(selectedDates[1]).diff(moment(selectedDates[0]), 'days')) * advert.price),
                                day: (moment(selectedDates[1]).diff(moment(selectedDates[0]), 'days')),
                                day_price: advert.price
                            });
                        } else {
                            renderAdvertPrice({total: 0,day: 0, day_price: advert.price});
                        }
                    }
                });
            resolve();
        });

    }
    modal({template: rezervationForm, title: 'Yeni Rezervasyon', width: 650})
        .do((t) => template = t)
        .then(() => Menkule.get("/adverts/" + advert.advert.id).do(a => advert = a))
        .then(() => InitCalendar())
        .then(() => {

            // On Share Email
            template.formFields('share_email').on('change', (e) => {
                if($(e.target).is(':checked')){
                    template.find('.rezervation').disableForm();
                    template.find('button.acceptbtn').attr('disabled', true);
                    template.find('.email-share').show();
                } else {
                    template.find('.email-share').hide();
                }

                if(!template.formFields('share_email').is(':checked') && !template.formFields('share_gsm').is(':checked')) {
                    template.find('.rezervation').enableForm();
                    template.find('button.acceptbtn').removeAttr('disabled');
                }

            });
            // On Share Gsm
            template.formFields('share_gsm').on('change', (e) => {
                if($(e.target).is(':checked')){
                    template.find('.rezervation').disableForm();
                    template.find('button.acceptbtn').attr('disabled', true);
                    template.find('.gsm-number-share').show();
                } else {
                    template.find('.gsm-number-share').hide();
                }

                if(!template.formFields('share_email').is(':checked') && !template.formFields('share_gsm').is(':checked')) {
                    template.find('.rezervation').enableForm();
                    template.find('button.acceptbtn').removeAttr('disabled');
                }
            });
            // On rezervation
            template.find('button.acceptbtn').on('click', (e) => {
                template.find('.rezervation').validateFormAsync(rezervationFormRules).then((data) => {

                    console.log(data);
                });
            })

        });
}