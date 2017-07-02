import template from './header.handlebars';

export default function () {
  return new Promise((resolve, reject) => {
    console.log('deneme');
    //$("body").html(template({ deneme: 'Asd' }));
    resolve();
  });
}
