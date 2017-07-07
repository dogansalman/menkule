import template from './main.handlebars';
import Header from '../header';
import Footer from '../footer';

/**
 * Main page
 */
export default () => Header(false).then(() => Footer()).then(() => $("body").zone("content").setContentAsync(template()));