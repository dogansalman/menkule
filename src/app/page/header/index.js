import template from './header.handlebars';
import messages from './messages.handlebars';
import alerts from './alerts.handlebars';
import Header from '../header';
import Confirm from '../../modal/confirm';
import appMessages from '../../../lib/appMessages';
import policy from '../user/policy/policy.handlebars';


export default (isOpen) => Menkule.user(true)
  .then(user => $("body").zone('header').setContentAsync(template({ user, isOpen: isOpen || false }))
      .then(header => new Promise(resolve => {

    // User Logged
    if (user) {

      // On new message
      Menkule.on('new.message', (message) => {
        App.promise(() => user.messages.findIndex(ms => ms.id === message.id))
          .then((msgIndex) => App.promise(() => {
            if (msgIndex > -1) user.messages.splice(msgIndex, 1)
          }))
          .then(() => App.promise(() => user.messages.unshift(message)))
          .then(() => $("body").zone('messages').setContentAsync( messages({message: user.messages})))
      });

      // On new notification
      Menkule.on('new.notification', (notification) => {
            App.promise(() => user.notifications.push(notification))
                .then(() => App.promise(() => user.notification_size = +1))
                .then(() => Menkule.emit('render.notification', user.notifications));
        });

      // Render notifications
      Menkule.on('render.notification', (notifications) => {
        $("body").zone('alert').setContentAsync( alerts({alert: notifications}))
            .then((notify_template) => {
                notify_template.find('.alertmessage-alert-title').on('click', (e) => {
                    e.preventDefault();
                    if ($(e.target).closest('.alertmessage-alert-title')) {
                        const notification_id = $(e.target).closest('.alertmessage-alert-title').attr('bind-data');
                        if(notification_id) {
                            Menkule.put("/notifications/" + notification_id)
                                .then(() => {
                                    const notify = user.notifications.find(n => n.id == notification_id);
                                    if(notify) App.navigate(notify.rezervation_id ? '/user/rezervation/' + notify.rezervation_id : 'user/alerts');
                                })
                        }
                    }
                })
            })
    });

      // Notifications
      Menkule.get('/notifications/last/10').do(n => Object.assign(user, {notifications: n}))
          .then((notifications) => Menkule.emit('render.notification', notifications));

     // Messages
      Menkule.get('/message/last/10').do(m => Object.assign(user, {messages: m}))
          .then((message) => $("body").zone('messages').setContentAsync( messages({message: message})))

      //On clicked alert button
      header.find('.newalert-alert-btn').click(e => {
        App.isMobile()
          .then((mbl) => {
            if (mbl) App.navigate('/user/alerts')
          })
          .then(() => {
            if (!e.target.closest('.alertlists')) {
              header.find('.open').removeClass('open');
              e.preventDefault();
              header.find('.alertlists').toggleClass('open');
            }
          })
      });

      //On clicked message button
      header.find('.newmessage-alert-btn').click(e => {
        App.isMobile()
          .then((mbl) => {
            if (mbl) App.navigate('/user/messages/')
          })
          .then(() => {
            if (!e.target.closest('.messagelist')) {
              header.find('.open').removeClass('open');
              e.preventDefault();
              header.find('.messagelist').toggleClass('open');
            }
          })
      });

    }

    //Focusout close nav menu
    $(window).on('click', e => {
      if (!e.target.closest('.newmessage-alert-btn') && !e.target.closest('.newalert-alert-btn')) header.find('.open').removeClass('open');
      if (!e.target.closest('.rightbigmenu') && !e.target.closest('.bigmenu_btn')) header.find('.rightbigmenu').removeClass('bigmenu-open') && $('body').removeClass('open-bar');

    })

    header.find('.drop').click(e => {
      if(!(e.target).closest('.drop-link')) e.preventDefault() || $(e.target).closest('.drop').toggleClass('down');
    });

    header.find('.loginbtn_menu > a').click(e => {
      e.preventDefault();
      App.Login().then((user) => App.emit('logged.user', user));
    });

    header.find('.ownerstart').click(e => {
      e.preventDefault();
      let modal;
      Confirm({message: policy(), title: appMessages('ownership_title'), width: '80%', Ok:'Kabul Ediyorum', Cancel:'Kabul Etmiyorum', Center: true}).do(m => modal = m)
        .then(() => Menkule.post('/users/approve/ownership'))
        .then(() => Menkule.user(true))
        .then(() => App.promise(() => modal.modal('hide')))
        .then(() => App.promise(() => App.emit('changed.header', true)))
        .then(() => App.showNotify({type:'success',message:' Artık ev sahipliği yapabilir ve ilan oluşturabilirsiniz.',title:'Tebrikler',icon:'fa fa-bell-o'}))
        .catch((err) => {
          modal.modal('hide');
          console.log(err);
          App.showNotify({type:'danger',message:' Bir hata oluştu. Lütfen tekrar deneyin.',title:'Üzgünüz',icon:'fa fa-bell-o'});
        })
    });


    header.find('.bigmenu_btn').click(e => {
      e.preventDefault();
      header.find('.rightbigmenu').toggleClass('bigmenu-open');
      $('body').toggleClass('open-bar');

    });

    header.find('.closebigmenu').click(e => {
      e.preventDefault();
      header.find(".rightbigmenu").removeClass("bigmenu-open");
      $('body').removeClass('open-bar');
    });

    resolve();

  })));

App.on('logged.user', (user) => {
    App.emit('changed.header');
});

App.on('changed.header', (user) => {
    Header(false);
});



