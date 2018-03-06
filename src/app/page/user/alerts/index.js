import appMessages from '../../../../lib/appMessages';
import template from './alerts.handlebars';
import Header from '../../header';
import Footer from '../../footer';
import alerts from '../alerts';


export default() => {
  return new Promise((resolve) => {
    let alertList = [];
    Header()
      .then(() => Footer())
      .then(() => Menkule.get('/notifications'))
        .do(a => alertList = a)
      .then((alertList) => alertList.length > 0 ?  $("body").zone('content').setContentAsync(template({alerts: alertList})) : $("body").zone('content').setContentAsync(appMessages('alert_not_found')) )
      .then((template) => {

        // focus out dropdown
        $(window).on('click', e => {
            //template.find('.dropdown-container .open').removeClass('open');
            if (!e.target.closest('.dropdown-btn'))  template.find('.dropdown-container .open').removeClass('open');
        });
        // open dropdown
        template.find('.dropdown-container .dropdown-btn').on('click', (event) => {
              template.find('.dropdown-container .open').removeClass('open');
              $(event.target).toggleClass('open');
              $(event.target.offsetParent).find('.dropdown').toggleClass('open');
          });

        //select click
        template.find(".alert-check").on("click", (e) => {
          $(e.target).parents('a').toggleClass("alert-selected");
        });
        //dropdown select click
        template.find(".select").on("click", (e) => {
         $(e.target).parents('.alertlisting').find('a').first().toggleClass("alert-selected");
        });
        //dropdown delete
        template.find(".delete-notify").on("click", (e) => {
            App.showPreloader(.7)
                .then(() =>  Menkule.delete("/notifications/" + $(e.targetas).attr("rel")))
                .then(() =>  App.hidePreloader())
                .then(() =>  App.notifySuccess('Seçtiğiniz bildirim kayıtları silindi', ''))
                .then(() =>  alerts())
                .catch(err => App.hidePreloader() && App.notifyDanger(err.responseJSON.Message, ''))
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

        if(template.find('.alert-selected').length === 0) return;
          App.showPreloader(.7)
            .then(() => {
              template.find('.alert-selected').each(function (index) {
                Menkule.delete("/notifications/" + $(this).attr("rel"))
                  .then(result => resolve())
                  .catch(err =>  reject(err))
              });
            })
            .then(() => App.hidePreloader())
            .then(() =>  App.notifySuccess('Seçtiğiniz bildirim kayıtları silindi', ''))
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