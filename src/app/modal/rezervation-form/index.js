import modal from '../../components/modal';
import rezervationForm from './rezervation-form.handlebars';
import flatpickr from "flatpickr"
import Turkish from 'flatpickr/dist/l10n/tr.js';
import advertPrice from './advert-price.handlebars';
import visitorModal from '../../modal/visitor';
import visitorList from '../../page/rezervation/visitors.handlebars';
import Visitor from "../visitor";

export default (advert) => {

    let template;
    const rezervationFormRules = {
        'name': [App.validate.REQUIRED, App.validate.STRING],
        'lastname': [App.validate.REQUIRED, App.validate.STRING],
        'email': [App.validate.REQUIRED, App.validate.EMAIL],
        'gsm': [App.validate.REQUIRED, App.validate.PHONE],
        'identity_no': [App.validate.REQUIRED, App.validate.NUMBER, App.validate.BETWEEN(10, 12)],
        'gender': [App.validate.REQUIRED, function (value, fields) {
            return ($(fields['gender']).fieldValue() === 'Bayan' || $(fields['gender']).fieldValue() == 'Bay');
        }]
    };
    const rezervationShareRules = {
        'fullname': [App.validate.REQUIRED, App.validate.STRING],
        'gsm':  [],
        'email': [],

    };

    const visitors = [];

    /*
    Add new visitor
     */
    function addVisitor(visitor) {
        return new Promise((resolve) => {
            App.promise(() => visitors.filter(item => JSON.stringify(item) == JSON.stringify(visitor)).length == 0 ? false : true)
                .then((isExist) => { if (!isExist) visitors.push(visitor) })
                .then(() => resolve(visitors))
        });
    }
    /*
    Render visitor
     */
    function renderVisitor() {
        return new Promise((resolve) => {
            template.zone('visitor').setContentAsync(visitorList({visitor: visitors}))
                .then((visitorTemplate) => {
                    //render visitor count block
                    //advertDetailTemplateGlobal.zone('visitor-count').setContentAsync(VisitorCountBlock({visitor: visitors.length +1}));
                    //remove visitor
                    visitorTemplate.find('.remove-visitor').on('click', (e) => {
                        e.preventDefault();
                        App.promise(() => App.showPreloader(.7))
                            .then(() => App.promise(() => $(e.target).closest('.visitor').attr('data-index')))
                            .then((visitorIndex) => App.promise(() => visitors.splice(visitorIndex, 1)))
                            .then(() => App.hidePreloader())
                            .then(() => renderVisitor())
                            .catch(() => App.hidePreloader())
                    })
                })
                .then(() => resolve(true));
        });
    }


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


            //get reserved date
            var reserved_dates = _.map(_.map(_.filter(advert.unavailable_date, function (o) {
                return o.rezervation_id > 0;
            }), 'fulldate')).map(function (x) {
                return moment(new Date(moment(x)._d)).format('DD/MM/YYYY');
            });
            //get unavailable date
            var unavailable_dates = _.map(_.map(_.filter(advert.unavailable_date, function (o) {
                return o.rezervation_id === 0;
            }), 'fulldate')).map(function (x) {
                return moment(new Date(moment(x)._d)).format('DD/MM/YYYY');
            });

            // Init Calendar
            flatpickr.localize(flatpickr.l10ns.tr);
            flatpickr(template.find('.calendar')[0],
                {
                    mode: 'range',
                    minDate: 'today',
                    static: true,
                    dateFormat: 'd/m/Y',
                    //enable:enabledDates,
                    //disable: advert.unavailable_date.map(t => moment(new Date(moment(t.fulldate)._d)).format('YYYY-MM-DD')),
                    disable: reserved_dates,
                    defaultDate: unavailable_dates,
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
                    },
                    onDayCreate: function (dObj, dStr, fp, dayElem) {
                        if ($(dayElem).hasClass('disabled')) {
                            const unavaiableDate = advert.unavailable_date.find(d => moment(new Date(d.fulldate)).format('YYYY/MM/DD') == moment(new Date(dayElem.dateObj)).format('YYYY/MM/DD') && d.rezervation_id);
                            if(unavaiableDate) {
                                dayElem.innerHTML += "<span class='event reserved point'>#" + unavaiableDate.rezervation_id + "</span>";
                                dayElem.setAttribute('data-id', unavaiableDate.rezervation_id);
                            }
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

            const openedModal = template.parents('.modal');

            template.find('button.addvisitor').on('click', () => {
               visitorModal().then((visitor) => addVisitor(Object.assign(visitor, { 'is_visitor': true })))
                   .then(() => renderVisitor())
            });
            // On Share Email

            template.find('#checkbox_mail').on('change', (e) => {

                if($(e.target).is(':checked')){
                    template.find('.rezervation').disableForm();
                    template.find('button.acceptbtn').attr('disabled', true);
                    template.find('.email-share').show();
                } else {
                    template.find('.email-share').hide();
                }

                if(!template.find('#checkbox_mail').is(':checked') && !template.find('#checkbox_gsm').is(':checked')) {
                    template.find('.rezervation').enableForm();
                    template.find('button.acceptbtn').removeAttr('disabled');
                }

            });
            // On Share Gsm
            template.find('#checkbox_gsm').on('change', (e) => {
                if($(e.target).is(':checked')){
                    template.find('.rezervation').disableForm();
                    template.find('button.acceptbtn').attr('disabled', true);
                    template.find('.gsm-number-share').show();
                } else {
                    template.find('.gsm-number-share').hide();
                }

                if(!template.find('#checkbox_mail').is(':checked') && !template.find('#checkbox_gsm').is(':checked')) {
                    template.find('.rezervation').enableForm();
                    template.find('button.acceptbtn').removeAttr('disabled');
                }
            });

            // On rezervation
            template.find('button.acceptbtn').on('click', (e) => {
                template.find('.rezervation').validateFormAsync(rezervationFormRules).then((data) => {
                    if(!template.formFields('date').val()) return App.notifyDanger('Lütfen giriş/çıkış tarihini seçin.','');
                    const checkin = moment(template.formFields('date').val().split(' - ')[0].trim(), 'DD/MM/YYYY').format('YYYY-MM-DD');
                    const checkout = moment(template.formFields('date').val().split(' - ')[1].trim(), 'DD/MM/YYYY').format('YYYY-MM-DD');

                    template.showPreloader(.7)
                        .then(() => Menkule.post('/rezervations/add', {'checkin':checkin, 'checkout': checkout, 'visitors': visitors, 'advert_id': advert.id, 'name': data.name, 'lastname': data.lastname, 'gsm': data.gsm, 'email': data.email, 'identity': data.identity_no, 'gender': data.gender}) )
                        .then((r) => openedModal.modal('hide') | App.notifySuccess('Rezervasyon kayıt edildi.',''))
                        .catch(err => App.notifyDanger(err.responseJSON.Message, '') | template.hidePreloader())

                });
            });

            // Share Button
            template.find('button.share_btn').on('click', (e) => {
                    template.find('.rezervation-share').validateFormAsync(rezervationShareRules)
                    .then((data) => {
                        if(!template.formFields('date').val()) return App.notifyDanger('Lütfen giriş/çıkış tarihini seçin.','');
                        const checkin = moment(template.formFields('date').val().split(' - ')[0].trim(), 'DD/MM/YYYY').format('YYYY-MM-DD');
                        const checkout = moment(template.formFields('date').val().split(' - ')[1].trim(), 'DD/MM/YYYY').format('YYYY-MM-DD');

                        if(data.gsm.trim() === '' && data.email.trim() === '') return  App.notifyDanger('Gsm numarası veya e-posta adresi belirtmelisiniz.', '');
                        console.log(Object.assign(data, {checkin: checkin, checkout: checkout, advert_id: advert.id}));
                    })
                    .catch(e => {
                        console.log(e);
                        template.hidePreloader();
                    })
            });

        });
}