import Bootstrap from 'bootstrap';
import modal from '../modal';
import Handlebars from 'handlebars/dist/handlebars.min.js';
import template from './modal.handlebars';
export default (options) => {

    options = Object.assign({
        template: null,
        title: 'Lütfen bekleyin',
        waitMessage: 'Lütfen bekleyin',
        width: 350,
        backdrop: true,
        keyboard: true,
        remote: false,
        data: {}
    }, options || {});

    const compiledTemplate = template({waitMessage: options.waitMessage, width: options.width, data : options.data, title: options.title});

      //modal preloaders
      $.fn.showPreloader = function (opacity = 0.6) {
        opacity = typeof opacity != "undefined" ? opacity : 1;
        return App.promise(() => {
          $(this).append("<div class='loading-process'></div>");
          $(this).find('.loading-process').css('opacity', opacity);
        });
      };
      $.fn.hidePreloader = function () {
        return App.promise(() => {
          $(this).find('.loading-process').remove();
        });
      };

    return new Promise(resolve => {

        //close event remove modal
        $(template).on('hidden.bs.modal', (e) => {
            e.target.remove();
        });

        //show event and render modal content
        $(template).on('shown.bs.modal', (e) => {
            $(template).zone('modal-body').setContentAsync( typeof options.template === 'function' ? options.template(options.data): options.template)
                .then(t => resolve(t));
        });

        //show modal
        $(compiledTemplate).modal({
            show: 'true',
            backdrop: options.backdrop,
            keyboard: options.keyboard,
            remote: options.remote,
        });

    });

}



