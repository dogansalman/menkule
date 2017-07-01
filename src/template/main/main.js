import template from './main.handlebars';

export default function () {
  return new Promise((resolve, reject) => {
    $("body").find("[data-zone='content']").html(template({ deneme: 'Main' }));
    resolve();
  });
}
