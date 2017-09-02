import modal from '../modal';
import confirmTemplate from './confirm.handlebars';
import appMessages from '../../../lib/appMessages';

export default () => {
    return new Promise((resolve,reject) => {

        modal({ template: confirmTemplate({message: appMessages('ownership_confirm'), title: appMessages('ownership_title')}), title: appMessages('ownership_title'), width:450 })
            .then((template) => {

            //get opened modal
            const openedModal = template.parents('.modal');

             //accept
             template.find('button.acceptbtn').on('click', (e) => {
                e.preventDefault();
                template.showPreloader(.7).then(() => resolve(openedModal));
             });

             //cancel
             template.find('button.cancelbtn, button.close').on('click', (e) => {
                e.preventDefault();
                openedModal.modal('hide');
             });

            })
    })
}