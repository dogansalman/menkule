import template from './main.handlebars';
import handlebarsHelper from '../../lib/handlebarsHelper';
export default function () {
  return new Promise((resolve, reject) => {
    $("body").find("[data-zone='content']").html(template({ deneme: 'Main' }));
    resolve();
  });
}
