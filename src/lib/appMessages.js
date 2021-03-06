export default (key) => {

    const messages = {
        //User
        'register_success': "<h2>Kayıt olduğunuz için teşekkür ederiz.</h2><p>Sizleri üye giriş sayfasına yönlendiriyoruz. Üye girişi gerçekleştirdikten sonra cep telefonunuza gelen onay kodu ile üyeliğinizi onaylamayı unutmayın.</p><p><i class='fa fa-clock-o'></i> <span class='sure'>kısa bir süre sonra</span> üye girişi sayfasına yönlendirileceksiniz.</p>",
        'token_fail': "<div class='container' <h2=''><h2>Geçersiz istek. Lütfen tekrar deneyin </h2><p>Her şifre yenileme talebi 2 saat için geçerlidir.</p><p> Eğer hesabınızın erişimi ile ilgili bizimile iletişime geçebilirsiniz.</p> </div>",
        'password_changed': "<div class='col-xs-12 col-sm-12 col-md-12 moffset2 bottomset2'> <h2>Şifreniz Güncellendi !</h2> <p>Şifreniz güncellendi yeni şifrenizi kullanarak hemen oturum açabilirsiniz...</p> </div>",
        'login_fail': " E-posta adresiniz veya şifreniz hatalı.",
        'forgot_fail': "E-posta adresiniz hatalı. Lütfen tekrar deneyin.",
        'changepass_fail': "Şifreniz hatalı. Lütfen tekrar deneyin.",

        //search
        'advert_error_search': "<div class='container'><div class='col-xs-12 disable_padding'> <h2>Üzgünüz beklenmedik bir hata!</h2> <p>Beklenmedik bir hata yaşandı. Lütfen tekrar deneyin. </p> </div></div>",
        'advert_no_result': "<div class='col-xs-12'> <h2>Sonuç bulunamadı</h2> <p> Üzgünüz aradığınız bölge için bir ilan kaydı bulunmamakta. </p> </div>",

        //adverts
        'advert_not_found': "<div class='container'><div class='col-xs-12 disable_padding'> <h2>Henüz bir kayıt bulunamamakta!</h2> <p>Henüz bir ilan kaydınız bulunmamaktadır. </p> </div></div>",
        'advert_failed': "<div class='container'><div class='col-xs-12 disable_padding'> <h2>Bu ilana erişim sağlanamadı</h2> <p>İlana erişememenizin nedeni aşağıdakilerden biri olabilir. </p> <p>İlan sahibi veya sistem tarafından yayından kaldırılmış olabilir. Eğer ilanın erişilebilir olması gerektiğini düşünüyorsanız lütfen bizimile iletişime geçiniz.</p> </div></div>",
        'error_adverts': "<div class='container'><div class='col-xs-12 disable_padding'> <h2>Hesabınızı Doğrulayın !</h2> <p>İlanlarınızı yönetmek için lütfen hesabınızı doğrulayın.</p> </div></div>",
        'error_advert_detail': "<div class='container'><div class='col-xs-12 disable_padding'> <h2>Üzgünüz. Bir sorun oluştu !</h2> <p>İlan detaylarına erişim sağlanmamaktadır. Bunun nedeni ilan size ait olmayabilir veya ilan kaydı silinmiş olabilir. </p> </div></div>",
        'feedback_failed': "<div class='required_alert' role='alert'> <strong>Üzgünüz !</strong> bildiriminiz iletilemedi. Lütfen tekrar deneyin. </div>",

        //messages
        'error_message_list': "<div class='container'><div class='col-xs-12 disable_padding'> <h2>Bir sorun oluştu!</h2> <p>Mesajlarınız listelenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin. </p> </div></div>",
        'error_message_detail': "<div class='container'><div class='col-xs-12 disable_padding'> <h2>Üzgünüz. Bir sorun oluştu !</h2> <p>Mesaj detaylarına erişim sağlanmamaktadır. Bunun nedeni mesaj size ait olmayabilir veya mesaj kaydı silinmiş olabilir. </p> </div></div>",
        'message_failed': "<div class='required_alert' role='alert'> <strong>Üzgünüz !</strong> Mesajınız iletilemedi. </div>",
        'message_not_found': "<div class='container'><div class='col-xs-12 disable_padding'> <h2>Henüz bir kayıt bulunmamakta!</h2> <p> Henüz bir mesaj kaydınız bulunmamaktadır.</p> </div></div>",
        //alerts
        'alert_not_found': "<div class='container'><div class='col-xs-12 disable_padding'> <h2>Henüz Yeni bildiriminiz bulunamamakta!</h2> <p>Henüz bir bildirim kaydınız bulunmamaktadır. </p> </div></div>",
        'error_alert_list': "<div class='container'><div class='col-xs-12 disable_padding'> <h2>Bir sorun oldu!</h2> <p>Bildirimleriniz listelenemedi. Daha sonra tekrar deneyin. </p> </div></div>",
        //visitors
        'visitor_error': "<div class='container'><div class='col-xs-12 disable_padding'> <p> Yeni misafir kaydı oluşturulamadı. Tekrar deneyin.</p> </div></div>",
        //comments
        'no_comments': "<div class='col-xs-12 disable_padding'> <h2>Henüz bir yorum bulunmamakta!</h2> <p>İlk yorum yapan siz olun!</p> </div>",
        'comments_failed': "Yorumunuz iletilemedi",
        //rezervations
        'no_rezervation': "<div class='container'><div class='col-xs-12 disable_padding'><h2>Rezevasyon bulunamadı!</h2> <p>Henüz bir rezervasyon kaydınız bulunmamaktadır.</p> </div></div>",
        'select_advert': "<div class='container'><div class='col-xs-12 disable_padding'><h2>İlan seçin!</h2> <p>Rezervasyonlarını görüntülemek istediğiniz ilanınızı seçin.</p> </div></div>",
        'rezervation_error': "<div class='container'><div class='col-xs-12 disable_padding'><h2>Bir sorun oluştu!</h2> <p>İlana erişim sağlanılamadı. Bu ilan yayından kaldırılmış olabilir. </p> </div></div>",
        'rezervation_title': 'REZERVASYONU ONAYLIYOR MUSUNUZ ?',
        'rezervation_confirm': 'Rezervasyon talebini onaylamak istediğiniz emin misiniz ? <br/> Onaylanan rezervasyon talebi üzerinde daha sonra değişiklik gerçekleştirilemez.',
        //confirms
        'ownership_title': 'EV SAHİPLİĞİ YAPMAK ÜZERESİNİZ!',
        'ownership_confirm': 'Ev sahipliği ile ile ek kazanç elde edebilir ve kullanmadığınız evinizi odanızı veya yazlığınızı değerlendirebilirsiniz. Ev sahipliği ile üyelik sözleşmesinde ki ev sahipliği şartlarını kabul etmiş olursunuz.',
        'rezervation_approved_title': 'REZERVASYONU ONAYLAMAK ÜZERESİNİZ!',
        'rezervation_approved_confirm': 'Rezervasyon talebini onaylamak istediğinize emin misiniz ? Onaylanan rezervasyon talebi anlık olarak misafirinize bildirilecektir.',
        'rezervation_cancel_title': 'REZERVASYONU İPTAL ETMEK ÜZERESİNİZ!',
        'rezervation_cancel_confirm': 'Rezervasyon talebini iptal etmek istediğinize emin misiniz ? İptal edilen rezervasyon bir daha onaylanmamaktadır!',

        //error
        'timeout': 'Sunucularımız yük altında. Lütfen daha sonra tekrar deneyiniz.',
        'error_title': 'Üzgünüz bir problem var !'



    };
    return messages[key] || "";
}