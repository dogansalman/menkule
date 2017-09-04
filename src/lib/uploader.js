    //Images List
    var imageList = [];
    //Uploader
    var container = null;

    //image limit
    var maxImage = 20;

    var default_icon = $('<a href="#" class="default-img"></a>');
    var emptyMessage = $('<div class="empty-message"><p>Fotoğraflar</p></div>');

    function uploader(){}

    ///////////////Private Functions
    function changeDefault(id){
        var arr = getImages();
        for (var i in arr) {
            arr[i].is_default = false;
        }
        var index = _.indexOf(arr, _.find(arr, {image_id: parseInt(id)}));
        Object.assign(arr[index],{'is_default':true});
        $(container).find("div i").parent().remove();
        $("div[data-id='" + arr[index].image_id  + "']").append($(default_icon));
        //renderImages();
    }
    function checkImageLimit() {
        return _.filter(getImages(), function(i) { return i.hasOwnProperty('deleted')} ).length > maxImage ? false : true
    }
    //Create Image Template
    function createImage(data) {
        //is deleted
        if(_.has(data, 'deleted')) return false;

        var deleteImageBtn = $('<a href="#" id="' + data.image_id + '" class="delete-img-btn"></a>');



        $(deleteImageBtn).on('click', (e) => {
            e.preventDefault();
            /*
             ConfirmPopup({ message: 'Fotoğrafı silmek istediğiniz emin misiniz ?' })
             .then(() => {
             uploader.findAndRemove('image_id', $(e.target).attr('id'));
             })
             .catch(() => console.log(''))
             */

        });
        var imageContainer = $('<div data-id="' + data.image_id + '"class="col-xs-12 col-sm-3 col-md-3 disable_padding" style=" width:140px; margin:10px 10px 10px 0px; max-height: 120px; overflow: hidden; display: inline-block; position: relative;"></div>');
        var image = $('<img style="width:100%; max-height: 150px !important; overflow: hidden; cursor:pointer;" src=' + Menkule.cloudinaryBaseUrl + "/w_150,h_150,c_fill/" +  data.url + ' id="' + data.image_id  + '"/>');

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
        if ( getImages() == null || getImages().length == 0 ) {
            $(getContainer()).append($(emptyMessage));
        }
        $.each(getImages(), function (index, data) {
            $(getContainer()).append($(createImage(data)));
        });
    }

    //Check Image
    function checkImage(image) {
        if (image == undefined) return false;

        if (image.size > 1048576) {
            App.notifyDanger("Fotoğraf boyutu en fazla 5MB olmalıdır!", 'Üzgünüz');
            return false;
        }
        var fileExtension = ['jpeg', 'jpg', 'png', 'bmp'];
        if ($.inArray(image.name.split('.').pop().toLowerCase(), fileExtension) == -1) {
            App.notifyDanger("Fotoğraf formatı " + fileExtension.join(', ') + " olabilir.", 'Üzgünüz');
            return false;
        }
        return true;
    }

    //Uploader Image to Advert
    function uploadImage(image) {
        if (!checkImage(image)) return false;
        //add to image list
        App.showPreloader(0.8)
            .then(() => Menkule.post("/photo/upload", image))
            .then((data) => {
                appendFile(data);
                renderImages();
                $("#uploader").val('');
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

    //Uploader Image to User
    function uploadPhotoUser(image,targetElm) {
        if (!checkImage(image)) return false;
        //add to image list
        App.showPreloader(0.8)
            .then(() => Menkule.post("/user/photo/upload", image))
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
        var uploader = $("<input type='file' style='display:none!important;' id='uploader' name='myfiles[]'  accept='image/*' />");
        $(uploader).on('change', (e) => {
            if(!isUserPhoto) uploadImage($(e.target).get(0).files[0]);
            if(isUserPhoto) uploadPhotoUser($(e.target).get(0).files[0],targetElm);
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
    //Get Images
    function getImages() {
      if(imageList.length == 0) return null;
      if (_.filter(imageList, function(i) { return (i.is_default && !i.hasOwnProperty('deleted'))}).length == 0) Object.assign(imageList[0],{'is_default':true});
      return imageList;
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
      imageList.push(Object.assign(image, {'new':true}));
    };
    //add empty message
    function setEmptyMessage () {
      if (getImages().length == 0) {
        $(getContainer()).append($(emptyMessage));
      }
    };
    //find and remove image
    function findAndRemove(property, value) {
      var array = getImages();
      array.forEach(function (result, index) {
        if (result[property] === parseInt(value)) {
          $("div[data-id='" + value + "']").remove();
          if(array[index].hasOwnProperty('is_default')) changeDefault(array[0].image_id);
          //Remove from array
          Object.assign(array[index],{'deleted':true,'is_default': false})
        }
      });
    }

    //extend return value
    var _valFn = $.fn.val;
    $.fn.val = function () {
        return $(this).data('uploader') ?  getImages() : _valFn.apply(this, arguments);
    };

    $.fn.createUploader = function (images) {
        $(this).data('uploader', true);
        return this.each(function () {
            //add style
            $(this).attr("style", "width: 100%; min-height: 150px; border: 1px solid #f9f9f9;");

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















