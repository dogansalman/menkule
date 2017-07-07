import template from './footer.handlebars';

function valide(email) {
  if ($(".list_mail").val().trim() == "" || !validateEmail(email)) {$(".list_mail").addClass("required"); return false;}
  return true;
}

function addEmailList(email) {
  if(!valide(email)) return false;
  $(".sendmail_btn").parent().parent().append("<div class='loading-process'></div>");
  Menkule.post("/other/mail-list", {"email": email })
    .then(result => {
      notifyshow_success("E-posta adresiniz listemize kayıt edildi.");
      $(".list_mail").val("");
    })
    .catch(err => {
      notifyshow("E-posta adresiniz listemize zaten kayıtlıdır.");
      new Error("eposta adresi kullanilmakta.");
    });
  $(".list_mail").removeClass("required");
}

export default () => $("body").zone('footer').setContentAsync(template())
  .then(footer => new Promise(resolve => {

    footer.find('.list_mail').on('keyup', (e) =>{
      e.preventDefault();
      if (e.keyCode == 13)  addEmailList($(".list_mail").val().substring(0, 90));
    });

    footer.find('.sendmail_btn').on("click", (e) => {
      e.preventDefault();
      addEmailList($(".list_mail").val().substring(0, 90));
    });

    resolve();
  }));