import loginTemplate from './login.handlebars'
import modal from '../modal';

export default () => {
    return new Promise(resolve => {
        modal({template: 'login'})
            .then(modalContent => {

                //bind modal content event and function
                console.log(modalContent);

            })
            .catch(err => reject(err));
    });
}


