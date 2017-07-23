import modal from './modal.handlebars';
import Bootstrap from 'bootstrap';
export default (options) => {
    options = Object.assign({
        template: null,
        title: 'Lütfen bekleyin',
        waitMessage: 'Lütfen bekleyin',
        width: 500,
        backdrop: true,
        keyboard: true,
        remote: false,
        templateData: {}
    }, options || {});

    //modal = $(modal).modal(Object.assign(options, {show: false}));
    //$('body').append(modal);

    $(modal).on('hidden.bs.modal', (e) => {
        modal.remove();
    });

    // Modal preloaded
    $.fn.showPreloader = function (opacity) {
        opacity = typeof opacity != "undefined" ? opacity : 1;
        return App.promise(() => {
            $(modal).find('.modal-body').append("<div class='loading-process'></div>");
            $(modal).find('.loading-process').css('opacity', opacity);
        });
    };
    $.fn.hidePreloader = function () {
        return App.promise(() => {
            $(modal).find('.modal-body').find('.loading-process').remove();
        });
    };

    $(modal).modal('show');


}
