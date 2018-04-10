import Header from '../../page/header';
import Footer from '../../page/footer';
import Visitors from './visitors.handlebars';
import VisitorCountBlock from './visitor-count.handlebars';
import Complate from './complate.handlebars';
import Activation from '../user/activate/activate.handlebars';
import Rezervation from './rezervation.handlebars';
import Visitor from '../../modal/visitor';
import _Rezervation from '../rezervation';
import Advert from './advert.handlebars';
import AppMessage from '../../../lib/appMessages';
import Confirm from "../../modal/confirm";
import ChangePass from '../../modal/password';

/*
Validate rezervation form
 */
const rezervationFormRules = {
    'name': [App.validate.REQUIRED, App.validate.STRING],
    'lastname': [App.validate.REQUIRED, App.validate.STRING],
    'email': [App.validate.REQUIRED, App.validate.EMAIL],
    'note': [App.validate.STRING],
    'gsm': [App.validate.REQUIRED, App.validate.PHONE],
    'identity_no': [App.validate.REQUIRED, App.validate.NUMBER, App.validate.BETWEEN(10, 12)],
    'gender': [App.validate.REQUIRED, function (value, fields) {
        return ($(fields['gender']).fieldValue() === 'Bayan' || $(fields['gender']).fieldValue() == 'Bay');
    }],
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
let modal = null;
let advertDetailTemplateGlobal;

/*
Activation form
 */
function getActivationForm(params) {
    return new Promise((resolve) => {
            $("body").zone('rezervation').setContentAsync(Activation({onRezervation: true}))
            .then((template) => {
                //scroll to top
                template.find('.activation-container').scrollView();

                //show notify password change
                App.notifySuccess('Şifrenizi hemen değiştirmek için lütfen buraya tıklayın.', 'Unutmayın !', true).then((notify) => {
                    notify.on('click', (e) => ChangePass());
                });

                //send active
                template.find(".active").on('click', (e) => {
                    template.find(".activation-container").validateFormAsync(activationFormRules)
                        .then(activationForm => {
                            App.showPreloader(.7)
                                .then(() => {
                                    Menkule.post("/users/approve/gsm", {
                                            "code": activationForm.code
                                        })
                                        .then(() => App.promise(() => App.emit('changed.header', true)))
                                        .then(() => App.wait(1000))
                                        .then(() => addVisitor({
                                            fullname: user.name + ' ' + user.lastname,
                                            tc: Number(user.identity_no),
                                            gender: user.gender,
                                            is_user: true
                                        }))
                                        .then((visitor) => Menkule.post('/rezervations', {
                                            'advert_id': params.id,
                                            'visitors': visitor,
                                            'checkin': rezervation.checkin,
                                            'checkout': rezervation.checkout,
                                            'note': user.note
                                        }))
                                        .then(() => templateRez.zone('rezervation').setContentAsync(Complate({ advert: advert, rezervation: rezervation, visitors: visitors })))
                                        .then((t) => App.promise(() => t.find('.complate').scrollView()))
                                        .then(() => App.hidePreloader())
                                        .then(() => modal.modal('hide'))
                                        .catch((err) => {
                                            // If Validate Error
                                            if (err instanceof ValidateError) {
                                              App.hidePreloader()
                                                .then(() => modal.modal('hide'))
                                                .then(() => {
                                                  template.formFields().enable();

                                                  return ($(err.fields[0]).select());
                                                })
                                            }
                                            App.hidePreloader().then(() => App.notifyDanger( err.responseJSON ? err.responseJSON.Message : 'Aktivasyon kodu hatalı. Lütfen tekrar deneyin.', ''))
                                        })
                                })
                        })
                        .catch(err => {
                          // If Validate Error
                          if (err instanceof ValidateError) {
                            App.hidePreloader().then(() => $(err.fields[0]).select())
                          }
                          else {
                            App.notifyDanger('Bir hata oluştu lütfen tekrar deneyin.', '');
                          }
                        });
                });
                //re send code
                template.find('.resend').on('click', (e) => {
                    App.showPreloader()
                        .then(() => {
                            Menkule.get("/users/validate/gsm/send", {})
                                .then(() => App.hidePreloader())
                                .then(() => App.notifySuccess('Aktivasyon kodu tekrar iletilmiştir.', 'Tamam'))
                                .then(() => template.zone('countdown').countdown(4))
                                .catch((err) => {
                                    App.hidePreloader();
                                    App.notifyDanger(err.responseJSON.Message, '')
                                });
                        });
                });

                //enter
                template.formFields().on('keyup', (e) => {
                  const keyCode = e.which || e.keyCode;
                  if (keyCode == 13) template.find('.active').triggerHandler('click');
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
            .then((isExist) => { if (!isExist) visitors.push(visitor) })
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
                //render visitor count block
                advertDetailTemplateGlobal.zone('visitor-count').setContentAsync(VisitorCountBlock({visitor: visitors.length +1}));
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
            .then(() => resolve(true));
    });
}

export default (params) => {

    if(!params.id || !Number.isInteger(Number(params.id))) return;

    //Logged User
    App.on('logged.user', (usr) => {
        if(location.pathname.indexOf('/rezervation/') >= 0 && !usr.new) {
            _Rezervation(params);
        }
    });

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
            .do(() => {
                let cancelable_date = new Date(new Date(rezervation.checkin).setDate(new Date(rezervation.checkin).getDate() - advert.advert.cancel_time));
                cancelable_date = moment(new Date(moment(cancelable_date)._d)).format('YYYY-MM-DD');
                let today = moment(new Date()).format('YYYY-MM-DD');
                if(moment(cancelable_date).diff(moment(today), 'days') > 0) Object.assign(rezervation, {cancelable_date: moment(new Date(moment(cancelable_date)._d)).format('DD/MM/YYYY')});
            })
            .then(() => $("body").zone('content').setContentAsync(Rezervation(Object.assign(Menkule.getUser() || {}, { advert: advert, rezervation: rezervation }))))
            .do(t => templateRez = t)
            .then((template) => {
                /* Advert detail */
                template.zone('advert').setContentAsync(Advert( { advert: advert, rezervation: rezervation, visitor: visitors.length })).then((advertDetailTemplate) => {
                    //set global
                    advertDetailTemplateGlobal = advertDetailTemplate;
                    /* Render default visitor count */
                    advertDetailTemplate.zone('visitor-count').setContentAsync(VisitorCountBlock({visitor: 1}));

                    advertDetailTemplate.find("[data-fancybox]").fancybox( { buttons : ['close']});
                    /* Create map and center */
                    advertDetailTemplate.find("#map").createMap({scroll:true});
                    advertDetailTemplate.find("#map").centerTo({
                        'lat': advert.advert.latitude,
                        'lng': advert.advert.longitude
                    }).zoom(18).addMarker({
                        'lat': advert.advert.latitude,
                        'lng': advert.advert.longitude
                    });
                    /* Disable new mark pin. */
                    advertDetailTemplate.find("#map").on('pin.map', function(e) {
                        e.preventDefault()
                    });
                    advertDetailTemplate.find('.image-counter').on('click', e => $.fancybox.open($("[data-fancybox]"), { buttons : ['close']}))
                });

                /* Add new visitor */
                template.find('.add-visitor').on('click', (e) => {
                   //if(advert.properties.visitor == (visitors.length +1)) App.notifyDanger('Bu ilan için en fazla ' + advert.properties.visitor + ' misafir kabul edilebilmektedir.','').then(() => return);
                   App.promise(() => advert.properties.visitor)
                   .if((advert.properties.visitor == (visitors.length +1)), () => {
                       App.notifyDanger('Bu ilan için en fazla ' + advert.properties.visitor + ' misafir kabul edilebilmektedir.','');
                   }).do(() => {
                       Visitor()
                           .then((visitor) => addVisitor(Object.assign(visitor, { 'is_visitor': true })))
                           .then(() => renderVisitor())
                   })
                });

                /* Login */
                template.find('.login-btn').click(e => {
                    e.preventDefault();
                    App.Login().then((user) => App.emit('logged.user', user))
                });

                /* Rezervation */
                template.find('.rezervation-btn').on('click', e => {
                    let confirmMessage = AppMessage('rezervation_confirm');
                    confirmMessage +=  rezervation.cancelable_date ? "<br/><b>Bu rezervasyon en geç " + rezervation.cancelable_date + " tarihin de iptal edilebilir.</b>": "<br/><b>Bu rezervasyon iptal edilemez.</b>";
                   $(".rezervation-form-container").validateFormAsync(rezervationFormRules)
                        .then((u) => App.promise(() => user = u))
                        .then(() => Confirm({message: confirmMessage , title: AppMessage('rezervation_title')}).do(m => modal = m))
                        .then(() => App.showPreloader(.8))
                        .then(() => Menkule.user())
                        .then((loggedUser) => App.promise(() => loggedUser ? Object.assign(user, loggedUser) : Object.assign(user, { 'new': true })))
                        .then(() => {

                            //If not exist logged user to register, login and send activation code and get activation form
                            if (user && user.new === true) {
                                Menkule.post("/users", user)
                                    .then((result) => App.promise(() => Menkule.saveToken(result.token)))
                                    .then(() => Menkule.user())
                                    .then((usr) => Object.assign(user, usr))
                                    .then(() => App.emit('logged.user', user))
                                    .then(() => getActivationForm(params)
                                    .then(() => App.hidePreloader()))
                                    .then(() => modal.modal('hide'))
                                    .catch(e => {
                                        modal.modal('hide');
                                        App.hidePreloader().then(() => App.parseJSON(e.responseText)).then(o => App.notifyDanger(o.Message, ''))
                                    })
                            }

                            //If user exist and identity no is null
                            if(user && !user.new && (!user.identity_no || user.identity_no.trim() === '')) {
                                Object.assign(user, {identity_no : template.find('.rezervation-form-container').fieldValue('identity_no')});
                                Menkule.put('/users', user).catch((err) => App.notifyDanger(err.Message, '') && console.log(err));
                            }

                            //If user exist and state is false resend gsm activation code and get activation form
                            if (user && user.state === false) {
                                Menkule.get("/users/validate/gsm/send")
                                    .then(() => getActivationForm(params))
                                    .then(() => App.hidePreloader()).then(() => modal.modal('hide'))
                                    .catch((err) => {
                                        modal.modal('hide');
                                        App.hidePreloader().then(() => App.notifyDanger(err.responseJSON.Message, ''))
                                    })
                            }

                            //If user exist and state is true create rezervation
                            if (user && user.state === true) {
                                addVisitor({
                                    fullname: user.name + ' ' + user.lastname,
                                    tc: user.identity_no,
                                    gender: user.gender,
                                    is_user: true
                                    })
                                    .then((visitor) => Menkule.post('/rezervations', {
                                        'advert_id': params.id,
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
                                    .then((t) => App.promise(() => t.find('.complate').scrollView()))
                                    .then(() => App.hidePreloader())
                                    .then(() => modal.modal('hide'))
                                    .catch((e) => {
                                        modal.modal('hide');
                                        App.hidePreloader().then(() => App.parseJSON(e.responseText)).then(o => App.notifyDanger(o.Message, ''))
                                    });
                            }

                        })
                        .catch((e) => {
                            if(modal) modal.modal('hide');
                            App.hidePreloader().then(() => App.parseJSON(e.responseText)).then(o => App.notifyDanger(o.Message, ''))
                        });
                })
            })
            .catch((err) => {
                App.promise(() => AppMessage('rezervation_error')).then((template) => $("body").zone('content').setContentAsync(template));
            })
            .then(() => resolve())
    })
}