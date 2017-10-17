import appMessages from '../../../../lib/appMessages';
import template from './alerts.handlebars';
import Header from '../../header';
import Footer from '../../footer';
import alerts from '../alerts';


export default() => {
  return new Promise((resolve) => {
    Header()
      .then(() => Footer())
      .then(() => Menkule.get('/notifications'))
      .then((alertList) => $("body").zone('content').setContentAsync(template({alerts: alertList})))
      .then((template) => {
        //select click
        template.find(".alert-check").on("click", (e) => {
          $(e.target).parents('a').toggleClass("alert-selected");
        });
        //select all click
        template.find(".selectall").on("click", (e) => {
          if(!$(e.target).hasClass('selected')) {
            $(".alert-check").addClass("alert-selected");
          }
          else{
            $(".alert-check").removeClass("alert-selected");
          }
          $(e.target).toggleClass('selected');
        });
        //delete selected
        template.find("button.deleteall").off().on("click", (e) => {
          App.showPreloader(.7)
            .then(() => {
              template.find('.alert-selected').each(function (index) {
                Menkule.delete("/notifications/" + $(this).attr("rel"))
                  .then(result => resolve())
                  .catch(err =>  reject(err))
              });
            })
            .then(() => App.hidePreloader())
            .then(() =>  App.notifySuccess('Seçtiğiniz bildirim kayıtları silindi', 'Tamam'))
            .then(() => alerts())
        });
        resolve();
      })
      .catch((err) => {
        $("body").zone('content').setContentAsync(appMessages('error_alert_list'));
        resolve();
      })

  })
}