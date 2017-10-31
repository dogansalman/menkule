import Header from '../../header';
import Footer from '../../footer';
import appMessage from '../../../../lib/appMessages';
import Rezervations from './rezervations.handlebars'

export default (params) => {
  return new Promise((resolve) => {
    Header()
      .then(() => Footer())
      .then(() => Menkule.get("/rezervations/" + params.type ))
      .then((rezevations) => $("body").zone('content').setContentAsync(Rezervations({rezervations: rezevations})))
      .catch((e) => {
      console.log(e);
        $("body").zone('content').setContentAsync(appMessage('no_rezervation'))
          .then(() => resolve());
      })
      .then(() => resolve());
  })
}
