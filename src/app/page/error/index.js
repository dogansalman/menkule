import Header from '../header';
import Footer from '../footer';
import error from './error.handlebars';
import appMessage from '../../../lib/appMessages';

export default(params) => {
    return new Promise((resolve) => {
        Header()
            .then(() => Footer())
            .then(() => $("body").zone('content').setContentAsync(error({'message': appMessage(params.error)})))
            .then(() => resolve())
    })
}