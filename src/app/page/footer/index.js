import footerTemp from './footer.handlebars';


var suggestionsForm = {
    email: [App.validate.REQUIRED, App.validate.EMAIL],
};

export default () => $("body").zone('footer').setContentAsync(footerTemp())
  .then(template => new Promise(resolve => {

      template.formFields().on('keyup', (e) => {
          var keyCode = e.which || e.keyCode;
          if (keyCode == 13) template.find('.sendmail_btn').triggerHandler('click');
      });

      template.find('.sendmail_btn').on('click', (e) => {
          $(e.target).disable();
          template.formFields().disable();
          App.showPreloader(.7)
              .then(() =>  template.find(".footer-email-suggestions").validateFormAsync(suggestionsForm))
              .then((suggestions) => Menkule.post('/suggestions', suggestions))
              .then(() => App.hidePreloader())
              .then(() => App.notifySuccess('E-posta adresiniz listemize ekledi.', ''))
              .catch((err) => {

                  App.hidePreloader()
                      .then(() => App.notifyDanger('E-posta adresiniz zaten kayıtlı.', ''))
                      .then(() => template.formFields().enable() && template.formFields().select() && $(e.target).enable())
                      .then(() => {
                          /*
                            If Validate Error
                         */
                          if (err instanceof ValidateError) {
                              template.formFields().enable();
                              $(e.target).enable();
                              return ($(err.fields[0]).select());
                          }
                      })
              });
      });

    resolve();
  }));