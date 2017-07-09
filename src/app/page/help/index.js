import template from './help.handlebars';
import Header from '../header';
import Footer from '../footer';

export default (params) => Header(false)
    .then(() => Footer())
    .then(() => {
        $('body').zone('content').setContentAsync(template())
            .then((content) => {
                if(params != null) content.find('#' + params.subject).scrollView();
                new Promise((resolve) => resolve())
            })
    })

