import Bootstrap from 'bootstrap';
import modal from '../modal';
import template from './modal.handlebars';

export default () => {

    $(template).on('hidden.bs.modal', (e) => {
        $(template).remove();
    });

    $(template).on('shown.bs.modal', (e) => {

        //$(template).zone('modal-content').setContentAsync(asd);

        //App.getTemplate(options.template, options.templateData)
        //    .then(html => template.zone('modal-content').setContentAsync(html))
        //    .then(template => resolve(template));
    });

    $(template()).modal({
        show: 'true'
    });
}


