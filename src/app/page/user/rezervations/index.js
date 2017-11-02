import Header from '../../header';
import Footer from '../../footer';
import appMessage from '../../../../lib/appMessages';
import Rezervations from './rezervations.handlebars'

export default (params) => {
    let rezervation = [];
  return new Promise((resolve) => {
    Header()
      .then(() => Footer())
      .then(() => Menkule.get("/rezervations/" + params.type )).do(r => rezervation = r)
      .then((rezevations) => $("body").zone('content').setContentAsync(rezevations.length > 0 ? Rezervations({rezervations: rezevations}) : appMessage('no_rezervation')))
      .catch((e) => {
        $("body").zone('content').setContentAsync(appMessage('no_rezervation'))
          .then(() => resolve());
      })
      .then(() => resolve());
  })
}
