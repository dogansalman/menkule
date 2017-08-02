import Bootstrap from 'bootstrap';
import modal from '../modal';
import template from './modal.handlebars';

export default (options) => {

    return new Promise(resolve => {

        $(template).on('hidden.bs.modal', (e) => {
            $(template).remove();
        });

        $(template).on('shown.bs.modal', (e) => {
            App.promise(() => require('../login/login.handlebars'))
                .then(mc=> $(template).zone('modal-content').setContentAsync(mc))
                .then(t => resolve(t));
        });

        $(template()).modal({
            show: 'true'
        });

    });

}


