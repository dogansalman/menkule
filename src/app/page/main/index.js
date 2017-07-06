import template from './main.handlebars';

/**
 * Main page
 */
export default (next) => {

  /**
   * Change body
   */
  $("body").find("[data-zone='content']").html(template({ deneme: 'Main' }));

  /**
   * Load complete
   */
  next();
};