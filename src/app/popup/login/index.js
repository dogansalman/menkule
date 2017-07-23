import modal from '../../page/modal';
import template from './login.handlebars';

export default () => {

    return new Promise(resolve => {
        console.log(template);
        $(modal).zone('modal-content').setContentAsync(template)
            .then(template => resolve(modal));
        resolve(modal);
    });

}


