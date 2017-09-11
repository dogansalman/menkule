import Handlebars from './handlebarHelper';
import * as _ from 'lodash';
import './validate';
import { extendMoment } from 'moment-range';
import 'moment/locale/tr';


/*
Moment Range & Locale
 */
extendMoment(moment);
moment.locale('tr');


// Disable
$.fn.disable = function () {
    return this.each(function () {
        if (['SELECT', 'INPUT', 'TEXTAREA', 'A', 'BUTTON'].indexOf(this.nodeName) === -1) return;
        $(this).attr('disabled', 'disabled');
    });
};
$.fn.enable = function () {
    return this.each(function () {
        if (['SELECT', 'INPUT', 'TEXTAREA', 'A', 'BUTTON'].indexOf(this.nodeName) === -1) return;
        $(this).removeAttr('disabled');
    });
};

$.fn.defaultText = function () {
  var txtbxt = $(this);
  $(txtbxt).focus(function() {
  $(txtbxt).data("DefaultText", $(txtbxt).val());
  if ($(txtbxt).val() != "" && $(txtbxt).val() == $(txtbxt).data("DefaultText")) $(txtbxt).val("");
  }).blur(function(){
      if ($(txtbxt).val() == "") $(txtbxt).val($(txtbxt).data("DefaultText"));
  });
};

// Get zone dom by name
$.fn.zone = function (name) {
    return $(this).find("[data-zone='" + name + "']");
};
// Set content async
$.fn.setContentAsync = function(content) {
    return new Promise(resolve => {
        setTimeout(() => {
            $(this).html(content);
            App.emit('change.dom', this);
            resolve($(this));
        }, 0);
    });
};
// Set content async
$.fn.appenndContentAsync = function(content) {
    return new Promise(resolve => {
        setTimeout(() => {
            $(this).append(content);
            App.emit('change.dom', this);
            resolve($(this));
        }, 0);
    });
};
$.fn.clearContentAsync = function() {
    return $(this).setContentAsync('');
};

// Exists
$.fn.exists = function () {
    return this.length > 0;
};

// clear form
$.fn.clearForm = function () {
    $(this).find('input').val('');
    $(this).find('textarea').val('');
    $(this).find('select').selectedIndex = 0
};


$.fn.applyRemote = function (url, options) {
    var el = $(this).toArray().find(e => true);
    if (url == "refresh" && !$(el).data("template")) return this;
    if (url != "refresh" && url != "reset") {
        options = Object.assign({
            post: null,
            resolve: "data",
            extraData: {},
            loadingText: "Lütfen bekleyin",
            wait: false
        }, options || {});
        $(el)
          .data("template", $(el).html())
          .data("url", url)
          .data("options", options)
          .html($(el).data("options").loadingText);
    } else {
        if (options && typeof options == "object") $(el).data("options", Object.assign($(el).data("options"), options));
        $(el)
          .data("options", Object.assign($(el).data("options"), { wait: (url == "reset") }))
          .html($(el).data("options").loadingText);
    }
    if ($(el).data("options").wait === true) return this;
    Menkule[options.post ? 'post' : 'get']($(el).data("url"), $(el).data("options").post || undefined).then(data => {
        var templateData = {};
        templateData[$(el).data("options").resolve] = data;
        $(el)
          .html(Handlebars.compile($(el).data("template"))(Object.assign(templateData, $(el).data("options").extraData)))
          .trigger(new $.Event('rendered.template'));
    });
    return this;
};


// Promise extends
Promise.prototype.equals = function (value) {
    return new Promise(resolve => {
        this.then(r => resolve(r == value));
    });
};
Promise.prototype.do = function (callable) {
    return new Promise((resolve, reject) => {
        this.then(r => {
            try {
                callable(r);
                resolve(r);
            } catch (err) {
                reject(err);
            }
       }).catch(err => reject(err));
    });
};
Promise.prototype.if = function (query, promiseFunc) {
  if (!query) return this;
  return new Promise((resolve, reject) => {
    promiseFunc().then(result => this).then(result => resolve(result)).catch(err => reject(err));
  });
};

// Custom Objects
window.DateRange = function DateRange(from, to) {
  this.from = from;
  this.to = to;
  this.from_day = from.get('date');
  this.from_month = from.get('month') + 1;
  this.from_year = from.get('year');
  this.to_day = to.get('date');
  this.to_month = to.get('month') + 1;
  this.to_year = to.get('year');
  this.from_fulldate = from.format('YYYY.MM.DD');
  this.to_fulldate = to.format('YYYY.MM.DD');
  this.uniq = from.format('MMDDYYYY') + to.format('MMDDYYYY');
  var _uniqKey = "MMDDYYYY";
  this.toUniqKey = function(){
    return (this.from.format(_uniqKey).toString() + this.to.format(_uniqKey).toString());
  }
};

window.Point = function Point(zoom, m) {
  this.zoom = zoom;
  this.latitude = m.getPosition().lat();
  this.longitude = m.getPosition().lng();
  this.marker = m;
  this.toVal = function () {
    return { zoom: this.zoom, latitude: this.latitude, longitude: this.longitude };
  };
};

//Char Converter
String.prototype.turkishToLower = function(){
  var string = this;

  var letters = { "İ": "i", "I": "i", "Ş": "s", "Ğ": "g", "Ü": "u", "Ö": "o", "Ç": "c","i": "i","ş": "s","ğ": "g","ü": "u", "ö": "o","ç": "c", "ı": "i" };
  string = string.replace(/(([İIŞĞÜÇÖiışğüçö]))/g, function(letter){ return letters[letter]; })
  return string.toLowerCase();
}
//get query parameter by name
String.prototype.getParameterByName = function(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec('?' + this);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
String.prototype.clearHtml = function() {
  return this.replace(/(<([^>]+)>)/ig, "").trim();
}

$.fn.scrollView = function () {
    return this.each(function () {
        $('html, body').animate({
            scrollTop: $(this).offset().top
        }, 1000);
    });
}
$.fn.useRegex = function (regexStr) {
  var re = new RegExp(regexStr);
  $(this).keypress(function(e) {
      if(!re.test(e.key)) e.preventDefault();
  });
}

Array.prototype._advertFilter = function(filter_option) {
    var advertlist = this;
    var datem = false;
  _.each(advertlist, function(advert, key) {

    //visitor
    if (filter_option.hasOwnProperty('visitor')) { if (parseInt(advert.visitor) < parseInt(filter_option.visitor)) Object.assign(advert, {deleted : true});}

    //beds
    if (filter_option.hasOwnProperty('beds')) { if (parseInt(advert.beds) < parseInt(filter_option.beds)) Object.assign(advert, {deleted : true});}

    //room
    if (filter_option.hasOwnProperty('room')) { if (parseInt(advert.room) < parseInt(filter_option.room)) Object.assign(advert, {deleted : true});}

    //advert type
    if(filter_option.hasOwnProperty('advert_type_id') && filter_option.advert_type_id > 0 ) {
     if (parseInt(advert.advert_type_id) !=  parseInt(filter_option.advert_type_id)) Object.assign(advert, {deleted : true});
    }
    //price
    if(filter_option.hasOwnProperty('price') && filter_option.hasOwnProperty('price_type') && filter_option.price > 0 ) {
      if(filter_option.price_type == 0)  {
        if (parseInt(advert.price) <  parseInt(filter_option.price)) Object.assign(advert, {deleted : true});
      } else {
        if (parseInt(advert.price) >  parseInt(filter_option.price)) Object.assign(advert, {deleted : true});
      }
    }

    //min layover
    if (filter_option.hasOwnProperty('min_layover')) {
       if ( parseInt(advert.min_layover) > parseInt(moment(filter_option.checkout).diff(moment(filter_option.checkin),'day') + 1)  ) Object.assign(advert, {deleted : true});
     }
    //available date
    if ((filter_option.hasOwnProperty('checkin') && filter_option.hasOwnProperty('checkout')) && advert.avaiabledate.length > 0) {
        _.each(advert.avaiabledate, function(avaiabledate, key) {
          if(!datem) {
            var startDate = new Date(moment(avaiabledate.from_date)),
            endDate   = new Date(moment(avaiabledate.to_date)),
            range = moment().range(startDate, endDate);
              for (var m = moment(filter_option.checkin); m.diff(moment(filter_option.checkout), 'days') <= 0; m.add(1, 'days')) {
                  var date = new Date(m);
                  if(!range.contains(date)) {
                      datem = false;
                      return;
                  }
                  datem = true;
              }
            return;
          }
        });
        if(!datem) Object.assign(advert, {deleted : true})
    }

  });
  _.remove(advertlist, {deleted:  true})
}
