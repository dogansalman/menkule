import Navigo from 'navigo';
let router = new Navigo();

router
  .on({
    '/test': function () {
      console.log('test');
    },
    '/products': function () { console.log('asdasd') },
  })
  .resolve();

  console.log(router)

