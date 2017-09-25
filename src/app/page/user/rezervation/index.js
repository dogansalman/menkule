import Header from '../../../page/header';
import Footer from '../../../page/footer';
import Rezervation from './rezervation.handlebars';

export default (params) => {
    let rezervation = null;
    let advert = null;

    return new Promise((resolve) => {
        Header()
            .then(() => Footer())
            .then(() => $('body').zone('content').setContentAsync(Rezervation()))
            .then(() => Menkule.post('/rezervation/detail', { rezervation_id : params.id}))
            .do((r) => rezervation = r)
            .then(() => Menkule.post('/search/advert/detail', {advertId: rezervation.advert_id}))
            .do((a) => advert = a)
            .then(() => console.log(advert, rezervation))
            .then(() => resolve());
    })
}
