import Header from '../../page/header';
import Footer from '../../page/footer';
import Visitors from './visitors.handlebars';
import Complate from './complate.handlebars';
import Activation from '../user/activate/activate.handlebars';
import Rezervation from './rezervation.handlebars';
import Visitor from '../../popup/visitor';
import _Rezervation from '../rezervation';

/*
Validate rezervation form
 */
const rezervationFormRules = {
    'name': [App.validate.REQUIRED, App.validate.STRING],
    'lastname': [App.validate.REQUIRED, App.validate.STRING],
    'email': [App.validate.REQUIRED, App.validate.EMAIL],
    'note': [App.validate.STRING],
    'gsm': [App.validate.REQUIRED, App.validate.PHONE],
    'tc': [App.validate.REQUIRED, App.validate.NUMBER, App.validate.BETWEEN(10, 12)],
    'accept_policy': function(value) {
        if (value !== true) {
            App.notifyDanger('Devam etmek için Üyelik Koşulları ve Ön Bilgilendirme formunu onaylamanız gerekmektedir.', 'Üzgünüz');
        }
        return value;
    }
};
/*
Vaslidate activation form
 */
const activationFormRules = {
    'code': [App.validate.REQUIRED, App.validate.NUMBER]
};

/*
   Global params
*/

let visitors = [];
let user = null;
let advert = {};
let rezervation = {};
let templateRez = null;

/*
Activation form
 */
function getActivationForm() {
    return new Promise((resolve) => {
            $("body").zone('rezervation').setContentAsync(Activation({onRezervation: true}))
            .then((template) => {
                //scroll to top
                template.find('.activation-container').scrollView();
                //send active
                template.find(".active").on('click', (e) => {
                    template.find(".activation-container")
                        .validateFormAsync(activationFormRules)
                        .then(activationForm => {
                            App.showPreloader(.7)
                                .then(() => {
                                    Menkule.post("/user/active/gsm", {
                                        "code": activationForm.code
                                    })
                                        .then(() => App.wait(1000))
                                        .then(() => addVisitor({
                                            fullname: user.name + ' ' + user.lastname,
                                            tc: user.tc,
                                            gender: user.gender,
                                            is_user: true
                                        }))
                                        .then((visitor) => Menkule.post('/rezervation/create', {
                                            'advert_id': advert.id,
                                            'visitors': visitor,
                                            'checkin': rezervation.checkin,
                                            'checkout': rezervation.checkout,
                                            'note': user.note
                                        }))
                                        .then(() => templateRez.zone('rezervation').setContentAsync(Complate({ advert: advert, rezervation: rezervation, visitors: visitors })))
                                        .then(() => App.promise(() => templateRez.find('.rezervation-container').scrollView()))
                                        .then(() => App.hidePreloader())
                                        .catch((err) => {
                                            App.hidePreloader()
                                                .then(() => App.notifyDanger('Aktivasyon kodu hatalı. Lütfen tekrar deneyin.', 'Üzgünüz'))
                                        })
                                })
                        })
                        .catch(fields => App.notifyDanger('Bir hata oluştu. Tekrar deneyin.', 'Üzgünüz'));
                })
                //re send code
                template.find('button.resend').on('click', (e) => {
                    App.showPreloader()
                        .then(() => {
                            Menkule.get("/user/gsm/resend", {})
                                .then(() => App.hidePreloader())
                                .then(() => App.notifySuccess('Aktivasyon kodu tekrar iletilmiştir.', 'Tamam'))
                                .catch((err) => {
                                    App.hidePreloader();
                                    App.notifyDanger(JSON.parse(err.responseText)['message'], 'Üzgünüz')
                                });
                        });
                });
            })
            .then(() => resolve())

    });
}

/*
Add new visitor
 */
function addVisitor(visitor) {
    return new Promise((resolve) => {
        App.promise(() => visitors.filter(item => JSON.stringify(item) == JSON.stringify(visitor)).length == 0 ? false : true)
            .then((isExist) => {
                if (!isExist) visitors.push(visitor)
            })
            .then(() => resolve(visitors))

    });
}
/*
Render visitor
 */
function renderVisitor() {
    return new Promise((resolve) => {
        templateRez.zone('visitor').setContentAsync(Visitors({visitor: visitors}))
            .then((visitorTemplate) => {
                //remove visitor
                visitorTemplate.find('.remove-visitor').on('click', (e) => {
                    e.preventDefault();
                    App.promise(() => App.showPreloader(.7))
                        .then(() => App.promise(() => $(e.target).closest('.visitor').attr('data-index')))
                        .then((visitorIndex) => App.promise(() => visitors.splice(visitorIndex, 1)))
                        .then(() => App.hidePreloader())
                        .then(() => renderVisitor())
                        .catch(() => App.hidePreloader())
                })
            })
            .then(() => resolve());
    });
}

export default (params) => {
    return new Promise((resolve) => {
        Header()
            .then(() => Footer())
            .then(() => Menkule.get('/adverts/find/' + params.id))
            .do(a => advert = a)
            .do(() => Object.assign(rezervation, {
                checkin: location.href.getParameterByName('checkin'),
                checkout: location.href.getParameterByName('checkout'),
                days: location.href.getParameterByName('days'),
                total: location.href.getParameterByName('total')
            }))
            .then(() => $("body").zone('content').setContentAsync(Rezervation(Object.assign(Menkule.getUser() || {}, { advert: advert, rezervation: rezervation }))))
            .do(t => templateRez = t)
            .then((template) => {

                /*
                  add new visitor
                 */
                template.find('.add-visitor').on('click', (e) => {
                    Visitor()
                        .then((visitor) => addVisitor(Object.assign(visitor, {
                            'is_visitor': true
                        })))
                        .then((visitors) => renderVisitor(visitors))
                });

                /*
                Login
                 */
                template.find('.login-btn').click(e => {
                    e.preventDefault();
                    App.Login().then((user) => App.emit('logged.user', user))
                });

                /*
                Rezervation
                 */
                template.find('.rezervation-btn').on('click', e => {
                    App.promise(() => App.showPreloader(.8))
                        .then(() => $(".rezervation-form-container").validateFormAsync(rezervationFormRules))
                        .then((u) => App.promise(() => user = u))
                        .then(() => Menkule.user())
                        .then((loggedUser) => App.promise(() => loggedUser ? Object.assign(user, loggedUser) : Object.assign(user, {
                            'new': true
                        })))
                        .then(() => {

                            //If not exist logged user to register, login and send activation code and get activation form
                            if (user && user.new === true) {
                                Menkule.post("/user/register", Object.assign(user, {
                                    // password: $.md5(Math.floor((Math.random() * 100000) + 1)),
                                    password: '132456789',
                                    gender: 'Bay'
                                }))
                                    .then(() => Menkule.post('/user/login', {email: user.email, password: user.password}))
                                    .then((result) => App.promise(() => Menkule.saveToken(result.result)))
                                    .then(() => Menkule.user())
                                    .then((usr) => Object.assign(user, usr))
                                    .then(() => App.emit('logged.user', user))
                                    .then(() => {
                                        Menkule.post("/user/gsm/resend")
                                    })
                                    .then(() => getActivationForm()
                                        .then(() => App.hidePreloader()))
                                    .catch(e => {
                                        App.hidePreloader().then(() => App.parseJSON(e.responseText)).then(o => App.notifyDanger(o.result || o.message, 'Üzgünüz'))
                                    });
                            }

                            //If user exist and state is false resend gsm activation code and get activation form
                            if (user && user.state === false) Menkule.post("/user/gsm/resend").then(() => getActivationForm()).then(() => App.hidePreloader());

                            //If user exist and state is true create rezervation
                            if (user && user.state === true) addVisitor({
                                fullname: user.name + ' ' + user.lastname,
                                tc: user.tc,
                                gender: user.gender,
                                is_user: true
                            })
                                .then((visitor) => Menkule.post('/rezervation/create', {
                                    'advert_id': advert.id,
                                    'visitors': visitor,
                                    'checkin': rezervation.checkin,
                                    'checkout': rezervation.checkout,
                                    'note': user.note
                                }))
                                .then(() => template.zone('rezervation').setContentAsync(Complate({
                                    advert: advert,
                                    rezervation: rezervation,
                                    visitors: visitors
                                })))
                                .then(() => App.promise(() => template.find('.rezervation-container').scrollView()))
                                .then(() => App.hidePreloader());
                        })
                        .catch((e) => {
                            console.log(e);
                            App.hidePreloader()
                                .then(() => App.parseJSON(e.responseText))
                                .then(o => App.notifyDanger(o.result || o.message, 'Üzgünüz'))
                        });

                })
            })
            .then(() => resolve());
    })
}

//Logged User
App.on('logged.user', (usr) => {
    if (!usr.new) {
        _Rezervation({id: advert.id});
    }
});
