import Navigo from 'navigo';
const root = "/";
const useHash = true; // Defaults to: false
const hash = '#!'; // Defaults to: '#'
let router = new Navigo(root, useHash, hash);


function Router(){
  this.preloaderElem = $('#page-preloader')[0];
}


router
  .on({
    '/test': function () {
      console.log('test');
    },
    '/products': function () { console.log('asdasd') },
  })
  .resolve();

  console.log(router)
export default Router;
