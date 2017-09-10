import Footer from '../../footer';
import Header from '../../header';
import policy from './policy.handlebars';

export default () => {

  new Promise((resolve) => {
    Header()
      .then(() => Footer())
      .then(() => $("body").zone('content').setContentAsync(policy))
      .then(() => resolve())
  })
}