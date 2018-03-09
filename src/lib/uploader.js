import Confirm from '../app/modal/confirm';

const uploader2 = new uploader();

//Images List
    var imageList = [];
    //Uploader
    var container = null;

    //image limit
    var maxImage = 20;

    var default_icon = $('<a href="#" class="default-img"></a>');
    var emptyMessage = $('<div class="empty-message"><p>Fotoğraflar</p></div>');
    var loader = $('<div class="uploading loading-process"><p></p></div>');


    /*
    Constructor uploader
     */
    function uploader(){}

    uploader.prototype.getImages = function () {
      if (imageList.length == 0) return null;
      if (_.filter(imageList, function (i) {
          return (i.is_default && !i.hasOwnProperty('deleted'))
        }).length == 0) Object.assign(imageList[0], {'is_default': true});
      return imageList;
    }


    ///////////////Private Functions
    function changeDefault(id){
        var arr = uploader2.getImages();
        for (var i in arr) {
            arr[i].is_default = false;
        }
        var index = _.indexOf(arr, _.find(arr, {id: parseInt(id)}));
        Object.assign(arr[index],{'is_default':true});
        $(container).find("div i").parent().remove();
        $("div[data-id='" + arr[index].id  + "']").append($(default_icon));
    }
    function checkImageLimit() {
        var images = uploader2.getImages();
        if(!images) return true;
        var imgLen = uploader2.getImages().filter(i => !i.deleted).length;
        return imgLen < maxImage;
    }
    //Create Image Template
    function createImage(data) {
        //is deleted
        if(_.has(data, 'deleted')) return false;

        var deleteImageBtn = $('<a href="#" id="' + data.id + '" class="delete-img-btn"></a>');

        $(deleteImageBtn).on('click', (e) => {
            e.preventDefault();
            let modal;
             Confirm({
                message: 'Fotoğrafı silmek istediğiniz emin misiniz ?',
                title: 'Emin misiniz ?'
             }).do(m => modal = m)
             .then(() => {
                 findAndRemove('id', $(e.target).attr('id'));
                 modal.modal('hide');
             })
             .catch((err) => console.log(err))
        });
        var imageContainer = $('<div data-id="' + data.id + '"class="col-xs-6 col-sm-3 col-md-3 disable_padding uploader-photo"></div>');
        var image = $('<img src=' + Menkule.cloudinaryBaseUrl + "/w_150,h_150,c_fill/" +  data.url + ' id="' + data.id  + '"/>');

        $(image).on('click', (e) => {
            e.preventDefault();
            changeDefault(e.target["id"]);
        });

        if(data.is_default) $(imageContainer).append($(default_icon));
        return $(imageContainer).append($(image)).append($(deleteImageBtn));
    }



    //Render Images
    function renderImages()
    {
        $(getContainer()).find('div').remove();
        if ( uploader2.getImages() == null || uploader2.getImages().length == 0 ) {
            $(getContainer()).append($(emptyMessage));
        }
        $.each(uploader2.getImages(), function (index, data) {
            $(getContainer()).append($(createImage(data)));
        });
        renderCounter();
    }
    // Render Images Counter
    function renderCounter()
    {
        $(getContainer()).find('.counter').remove();
        var images = uploader2.getImages();
        var imageCount = 0;
        if(images) imageCount = uploader2.getImages().filter(i => !i.deleted).length;
        var photoCounter = $('<div class="counter"><p>' + imageCount + '/' + maxImage + '</p></div>');
        $(getContainer()).append($(photoCounter));
    }
    //Check Image
    function checkImage(image) {
        if (image == undefined) return false;

        if (image.size > 8388608) {
            App.notifyDanger("Fotoğraf boyutu en fazla 8MB olmalıdır!", 'Üzgünüz');
            return false;
        }
        var fileExtension = ['jpeg', 'jpg', 'png', 'bmp'];
        if ($.inArray(image.name.split('.').pop().toLowerCase(), fileExtension) == -1) {
            App.notifyDanger("Fotoğraf formatı " + fileExtension.join(', ') + " olabilir.", 'Üzgünüz');
            return false;
        }
        return true;
    }

    function showLoader(){
        return App.promise(() => {
            $(getContainer()).find('.loader').remove();
            $(getContainer()).append($(loader));
        })
    }
    function hideLoader(){
        return App.promise(() => {
            $(getContainer()).find('.loader').remove();
        })
    }
    //Uploader Image to Advert
    function uploadImage(image) {
        if (!checkImage(image)) return false;
        //add to image list
        showLoader()
            .then(() => Menkule.post("/adverts/photo", image))
            .then((data) => {
                appendFile(data);
                renderImages();
                $("#uploader").val('');
            })
            //.then(() => hideLoader())
            .catch((err) => {
                $("#uploader").val('');
                hideLoader()
                    .then(() => App.parseJSON(err.responseText))
                    .then(o => App.notifyDanger(o.result || o.Message, 'Üzgünüz'))
                    .catch(o => App.notifyDanger(o, 'Beklenmeyen bir hata'));
            })
    }

    //Uploader Image to User
    function uploadPhotoUser(image,targetElm) {
        if (!checkImage(image)) return false;
        //add to image list
        App.showPreloader(0.8)
            .then(() => Menkule.post("/users/photo", image))
            .then((data) => {
                $("#uploader").val('');
                //create events and fire
                var _e = new $.Event('change.photo');
                _e['photo'] = data;
                $(targetElm).trigger(_e);
                if (_e.isDefaultPrevented()) return;


            })
            .then(() => App.hidePreloader())
            .catch((err) => {
                $("#uploader").val('');
                App.hidePreloader()
                    .then(() => App.parseJSON(err.responseText))
                    .then(o => App.notifyDanger(o.result || o.message, 'Üzgünüz'))
                    .catch(o => App.notifyDanger(o, 'Beklenmeyen bir hata'));
            })
    }

    //Uploader Button
    function uploaderButton() {
        var uploaderButton = $('<button class="uploader-btn uploader"></button>');
        //file select open
        $(uploaderButton).on('click', (e) => {
            e.preventDefault();
            if(!checkImageLimit()){
                App.notifyDanger('Üzgünüz','En fazla ' + maxImage + ' adet fotoğraf ekleyebilirsiniz.');
                return;
            }
            $('#uploader').trigger('click');
        });
        return uploaderButton;
    }

    //File Uploader
    function FileManager(isUserPhoto, targetElm) {
        $('#uploader').remove();
        var uploader = $("<input type='file' multiple style='display:none!important;' id='uploader' name='myfiles[]'  accept='image/*' />");
        $(uploader).on('change', (e) => {
            for (let i = 0; i < $(e.target).get(0).files.length; i++) {
                if(!isUserPhoto) uploadImage($(e.target).get(0).files[i]);
                if(isUserPhoto) uploadPhotoUser($(e.target).get(0).files[i],targetElm);
            }


        });
        return uploader;
    }


    //Set Uploader
    function setContainer(containerElm) {
      container = containerElm;
    };
    //Get Uploader
    function getContainer() {
      return container;
    };

    //Set Images
    function setImages(images) {
      Object.assign(imageList,images)
    };
    //Set Image Collection
    function setImageCollection (images) {
      imageList = images;
    };
    //Add Images
    function appendFile(image) {
      imageList.push(Object.assign(image, {'is_new':true}));
    };
    //add empty message
    function setEmptyMessage () {
      if (uploader2.getImages().length == 0) {
        $(getContainer()).append($(emptyMessage));
      }
    };
    //find and remove image
    function findAndRemove(property, value) {
      var array = uploader2.getImages();
      array.forEach(function (result, index) {
        if (result[property] === parseInt(value)) {
          $("div[data-id='" + value + "']").remove();
          if(array[index].hasOwnProperty('is_default')) changeDefault(array[0].id);
          //Remove from array
          Object.assign(array[index],{'deleted':true,'is_default': false})
        }
      });
        renderCounter();
    }

    //extend return value
    var _valFn = $.fn.val;
    $.fn.val = function () {
        return $(this).data('uploader') ?  uploader2.getImages() : _valFn.apply(this, arguments);
    };

    $.fn.createUploader = function (images) {
        $(this).data('uploader', true);
        return this.each(function () {

            //set uplaoder global
            setContainer($(this));

            //create uploader
            $(this).append($(emptyMessage));
            $(this).append($(FileManager()));
            $(this).append($(uploaderButton()));

            //exist images render
            if(images != null && images.length > 0){
                setImages(images);
                renderImages();
            }
            renderCounter();
        });

    };

    $.fn.directUploader = function () {
        $('body').append($(FileManager(true,$(this))));
        //file select open
        $(this).on('click', (e) => {
            e.preventDefault();
            $('#uploader').trigger('click');
        });

    };




    export default new uploader;













