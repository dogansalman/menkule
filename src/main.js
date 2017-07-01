import main from './template/main/main';
import App from './lib/app';
let a = new App();

main().then(() => console.log('header loaded'));