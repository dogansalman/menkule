import loginTemplate from './login.handlebars'
import modal from '../modal';



export default () => {
    return new Promise(resolve => {

        //modal-content e erişip burda login.handlebars ı append etmek gerek.

        console.log($(modal));
        console.log(modal);


        //resolve($(modal));

        //$(modalTemplate()).zone('modal-content').setContentAsync(loginTemplate())
        //     .then(() => resolve($(modal)));


    });

}


