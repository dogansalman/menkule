import template from './user-account.handlebars';

export default (params) => $('body').zone('content').setContentAsync(template())
  .then(content => new Promise(resolve => {
    console.log(params);
    resolve();
  }));