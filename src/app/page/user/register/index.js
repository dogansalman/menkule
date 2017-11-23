import Header from '../../header';
import Footer from '../../footer';
import template from './register.handlebars';

// Validate config
var registerFormRules = {
    'email': [App.validate.REQUIRED, App.validate.EMAIL],
    'name': [App.validate.REQUIRED, App.validate.STRING],
    'lastname': [App.validate.REQUIRED, App.validate.STRING],
    'gsm': [App.validate.REQUIRED, App.validate.PHONE],
    'password': [App.validate.REQUIRED],
    'password_retype': [App.validate.REQUIRED, function (value, fields) {
        return ($(fields['password']).fieldValue() === value);
    }],
    'accept_user_policy': function (value) {
        if (value !== true) {
            App.notifyDanger('Üyelik kaydı oluşturabilmeniz için lütfen üyelik koşullarını kabul edin.', 'Üzgünüz');
        }
        return value;
    }
};

export default () => Header(false)
    .then(() => Footer())
    .then(() => {
        $('body').zone('content').setContentAsync(template())
            .then((template) => {

            //Login
            template.find('.loginbtn').on('click', (e) => {
                e.preventDefault();
                App.Login().then((user) => App.emit('logged.user', user));
            });

            //Register Click
              template.find('.register').on('click', (e) => {
                  e.preventDefault();
                  $(e.target).disable();
                  $(".registercontainer").formFields().disable();
                  $(".registercontainer").validateFormAsync(registerFormRules)
                      .then(() => App.showPreloader(.7))
                      .then(() => $(".registercontainer").validateFormAsync(registerFormRules))
                      .then((registerForm) => Menkule.post('/users', registerForm))
                      .then(() => Menkule.post('/auth', {username: $(".registercontainer").fieldValue('email'), password: $(".registercontainer").fieldValue('password'), grant_type: 'password'}, 'application/x-www-form-urlencoded'))
                      .then((result) => App.promise(() => Menkule.saveToken(result)))
                      .then(() => App.navigate('/user/activate'))
                      .catch(err => {
                          $(e.target).enable();
                          $(".registercontainer").formFields().enable();
                          if (err instanceof ValidateError) return App.hidePreloader().then(() => $(err.fields[0]).select());
                          App.hidePreloader()
                              .then(o => App.notifyDanger(err.responseJSON.Message, 'Üzgünüz'));
                      });
              });

            new Promise((resolve) => resolve());

            })
    });