import modal from '../../components/modal';
import calendar from './calendar.handlebars';
import flatpickr from 'flatpickr';

export default (options) => {
    return new Promise((resolve) => {

        options = Object.assign({
            endRangeStyle: true,
        }, options || {});

        modal({template: calendar, width:320, title: 'Takvim'})
            .then((template) => {

                const openedModal = template.parents('.modal');

                /*
                Inıt calendar
                 */
                flatpickr.localize(flatpickr.l10ns.tr);
                flatpickr(template.find('#calendar')[0], {
                    inline: true,
                    mode: 'range',
                    minDate: 'today',
                    maxDate: moment(new Date()).add(1, 'year').format('YYYY-MM-DD'),
                    fullwidth: false,
                    center: true,
                    onChange: function(selectedDates, dateStr, instance) {
                        template.find('.acceptbtn').button('reset');
                    }
                });

                if(options.endRangeStyle) template.find('.flatpickr-calendar').addClass('disabled-endRange');

                /*
                Select date
                 */
                template.find('.acceptbtn').on('click', (e) => {
                    e.preventDefault();
                    const selectedRange = $('#calendar').val().split(" - ");
                    if(selectedRange.length < 2) return
                    resolve( new DateRange(moment(selectedRange[0].trim()), moment(selectedRange[1].trim())));
                    openedModal.modal('hide');
                }).button('loading');
            })
    })
}