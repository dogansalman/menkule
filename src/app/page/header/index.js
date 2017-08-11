import template from './header.handlebars';
import messages from './messages.handlebars';

export default (isOpen) => Menkule.user()
  .then(user => $("body").zone('header').setContentAsync(template({ user, isOpen: isOpen || false })).then(header => new Promise(resolve => {

    if (user) {
      // On new message
      Menkule.on('new.message', (message) => {
        App.promise(() => user.messages.findIndex(ms => ms.message_id == message.message_id))
          .then((msgIndex) => App.promise(() => {
            if (msgIndex > -1) user.messages.splice(msgIndex, 1)
          }))
          .then(() => App.promise(() => user.messages.unshift(message)))
          .then(() => App.promise(() => user.message_count = +1))
          .then(() => App.renderTemplate(header.find('#message-template').html(), {
            message: user.messages
          }))
          .then((msg_temp) => $("body").zone('messages').setContentAsync(msg_temp));
      });

      // On new notification
      Menkule.on('new.notification', (notification) => {
            App.promise(() => user.notifications.push(notification))
                .then(() => App.promise(() => user.alert_count = +1))
                .then(() => App.renderTemplate(header.find('#alert-template').html(), {
                    alert: user.notifications
                }))
                .then((msg_temp) => $("body").zone('alert').setContentAsync(msg_temp));
        });

      //On change notification
      Menkule.on('change.notification', () => {
        App.promise(() => App.promise(() => user.alert_count = user.notifications.length))
          .then(() => App.renderTemplate(header.find('#alert-template').html(), {
            alert: user.notifications
          }))
          .then((msg_temp) => $("body").zone('alert').setContentAsync(msg_temp))
          .then(() => {
            //On clicked notification
            header.find('.alertmessage-alert-title').on('click', (e) => {
              e.preventDefault();
              if ($(e.target).closest('.alertmessage-alert-title')) {
                Menkule.post("/alert/read", {
                  id: $(e.target).closest('.alertmessage-alert-title').attr('bind-data')
                }).
                then(() => App.promise(() => $(e.target).closest('li').fadeOut(500, function() {
                  $(e.target).closest('li').remove()
                })))
                  .then(() => App.promise(() => user.notifications.splice(user.notifications.findIndex(i => i.id == $(e.target).closest('.alertmessage-alert-title').attr('bind-data')), 1)))
                  .then(() => App.wait(1000))
                  .then(() => App.promise(() => Menkule.emit('change.notification')))
              }
            })
          })
          .then(() => header.find('.alertlists').addClass('open'))
      });



      //render messages
      App.renderTemplate(messages(), {
        message: user.messages
      })
       .then((msg_temp) => $("body").zone('messages').setContentAsync(msg_temp))
       //.then((msg_temp) => console.log(msg_temp))


      //render notification
      //App.renderTemplate(header.find('#alert-template').html(), {
      //  alert: user.notifications
      //})
      //  .then((msg_temp) => $("body").zone('alert').setContentAsync(msg_temp))
      //  .then(() => {
          //On clicked notification
      //    header.find('.alertmessage-alert-title').on('click', (e) => {
      //      e.preventDefault();
      //      if ($(e.target).closest('.alertmessage-alert-title')) {
      //        Menkule.post("/alert/read", {
      //          id: $(e.target).closest('.alertmessage-alert-title').attr('bind-data')
      //        }).
      //        then(() => App.promise(() => $(e.target).closest('li').fadeOut(500, function() {
      //          $(e.target).closest('li').remove()
      //        })))
      //          .then(() => App.promise(() => user.notifications.splice(user.notifications.findIndex(i => i.id == $(e.target).closest('.alertmessage-alert-title').attr('bind-data')), 1)))
      //          .then(() => App.wait(1000))
      //          .then(() => App.promise(() => Menkule.emit('change.notification')))
      //      }
      //    })
      //  })
    }

    header.find('.newalert-alert-btn').click(e => {
      App.isMobile()
        .then((mbl) => {
          if (mbl) App.navigate('/user/alert/list')
        })
        .then(() => {
          if (!e.target.closest('.alertlists')) {
            header.find('.open').removeClass('open');
            e.preventDefault();
            header.find('.alertlists').toggleClass('open');
          }
        })
    });

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
      App.Ownershipping().then(() => App.emit('changed.header', true));
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


// When user logged
App.on('logged.user', (user) => {
    App.emit('changed.header');
});

// When header changed
App.on('changed.header', (isOpen) => {
    module.exports(isOpen).then();
});
