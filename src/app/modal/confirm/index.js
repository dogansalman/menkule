import modal from '../../components/modal';
import confirmTemplate from './confirm.handlebars';

export default (options) => {


  options = Object.assign({
    message: 'İşleme devam etmek istediğinize emin misiniz ?',
    title: 'Emin misiniz ?',
    width: 450,
    Ok: 'Evet',
    Cancel: 'Hayir',
    Center: false
  }, options || {});

    return new Promise((resolve,reject) => {

        modal({ template: confirmTemplate({message: options.message, title: options.title, Ok: options.Ok, Cancel: options.Cancel, Center: options.Center}), title: options.title, width: options.width})
            .then((template) => {

            //get opened modal
            const openedModal = template.parents('.modal');

            //remove modal header
            openedModal.find('.modal-header').remove();

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