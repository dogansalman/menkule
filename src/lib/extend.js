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

// countdown timer
$.fn.countdown = function(minutes, msg = "") {

    var element = this;
    var d1 = new Date (),
        d2 = new Date ( d1 );
    d2.setMinutes ( d1.getMinutes() + Number(minutes) );
    var countDownDate = d2.getTime();

    // Update the count down every 1 second
    var x = setInterval(function() {
        // Get todays date and time
        var now = new Date().getTime();
        // Find the distance between now an the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        element.text( minutes + " Dak. " + seconds + " San." + " " + msg);

        // If the count down is over, write some text
        if (distance < 0) {
            clearInterval(x);
            element.text("");
            var _e = new $.Event('countdown.finished');
            element.trigger(_e);
        }
    }, 1000);

};
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
// show loader
$.fn.showLoading = function() {
    return new Promise(resolve => {
        $(this).append("<div class='loading-zone' id='page-preloader' style='opacity: 0.6;'></div>");
        resolve();
    })
};
// show loader
$.fn.hideLoading = function() {
    return new Promise(resolve => {
        $(this).find('.loading-zone').remove();
        resolve();
    })
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
// disable form
$.fn.disableForm = function () {
    $(this).find('input').attr('disabled', true).removeClass('required');
    $(this).find('textarea').attr('disabled', true).removeClass('required');
    $(this).find('select').attr('disabled', true).removeClass('required');
};
// enable form
$.fn.enableForm = function () {
    $(this).find('input').removeAttr('disabled');
    $(this).find('textarea').removeAttr('disabled');
    $(this).find('select').removeAttr('disabled');
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
    Menkule[options.post ? 'post' : 'get']($(el).data("url") + ( $(el).data("options").urlPar ? '/' + $(el).data("options").urlPar : '' ) , $(el).data("options").post || undefined).then(data => {
        var templateData = {};
        templateData[$(el).data("options").resolve] = data;
        $(el)
          .html(Handlebars.compile($(el).data("template"))(Object.assign(templateData, $(el).data("options").extraData)))
          .trigger(new $.Event('rendered.template'));
    });
    return this;
};
$.fn.scrollView = function () {
    return this.each(function () {
        $('html, body').animate({
            scrollTop: $(this).offset().top
        }, 1000);
    });
};
$.fn.useRegex = function (regexStr) {
    var re = new RegExp(regexStr);
    $(this).keypress(function(e) {
        if(!re.test(e.key)) e.preventDefault();
    });
};
$.fn.handleCounter = function (options) {
    var $input,
        $btnMinus,
        $btnPlugs,
        minimum,
        maximize,
        writable,
        onChange,
        onMinimum,
        onMaximize;
    var $handleCounter = this
    $btnMinus = $handleCounter.find('.counter-minus')
    $input = $handleCounter.find('input')
    $btnPlugs = $handleCounter.find('.counter-plus')
    var defaultOpts = {
        writable: true,
        minimum: 1,
        maximize: null,
        onChange: function () {
        },
        onMinimum: function () {
        },
        onMaximize: function () {
        }
    };
    var settings = $.extend({}, defaultOpts, options)
    minimum = settings.minimum
    maximize = settings.maximize
    writable = settings.writable
    onChange = settings.onChange
    onMinimum = settings.onMinimum
    onMaximize = settings.onMaximize
    if (!$.isNumeric(minimum)) {
        minimum = defaultOpts.minimum
    }
    if (!$.isNumeric(maximize)) {
        maximize = defaultOpts.maximize
    }
    var inputVal = $input.val()
    if (isNaN(parseInt(inputVal))) {
        inputVal = $input.val(0).val()
    }
    if (!writable) {
        $input.prop('disabled', true)
    }

    changeVal(inputVal)
    $input.val(inputVal)
    $btnMinus.click(function () {
        var num = parseInt($input.val())
        if (num > minimum) {
            $input.val(num - 1)
            changeVal(num - 1)
        }
    })
    $btnPlugs.click(function () {
        var num = parseInt($input.val())
        if (maximize == null || num < maximize) {
            $input.val(num + 1)
            changeVal(num + 1)
        }
    });
    var keyUpTime
    $input.keyup(function () {
        clearTimeout(keyUpTime)
        keyUpTime = setTimeout(function () {
            var num = $input.val()
            if (num == '') {
                num = minimum
                $input.val(minimum)
            }
            var reg = new RegExp("^[\\d]*$")
            if (isNaN(parseInt(num)) || !reg.test(num)) {
                $input.val($input.data('num'))
                changeVal($input.data('num'))
            } else if (num < minimum) {
                $input.val(minimum)
                changeVal(minimum)
            } else if (maximize != null && num > maximize) {
                $input.val(maximize)
                changeVal(maximize)
            } else {
                changeVal(num)
            }
        }, 300)
    });
    $input.focus(function () {
        var num = $input.val()
        if (num == 0) $input.select()
    });

    function changeVal(num) {
        $input.data('num', num)
        $btnMinus.prop('disabled', false)
        $btnPlugs.prop('disabled', false)
        if (num <= minimum) {
            $btnMinus.prop('disabled', true)
            onMinimum.call(this, num)
        } else if (maximize != null && num >= maximize) {
            $btnPlugs.prop('disabled', true)
            onMaximize.call(this, num)
        }
        onChange.call(this, num)
    }
}

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


      if(promiseFunc instanceof Promise) {
          promiseFunc().then(result => this).then(result => resolve(result)).catch(err => reject(err));
      }
      else{
          const resultFunc =  promiseFunc();
          if(resultFunc instanceof Promise) resultFunc.then(result => this).then(result => resolve(result)).catch(err => reject(err));
      }


  });
};

window.getDateRange = function getDateRange(startDate, endDate, dateFormat, lastDate = true){
    startDate = moment(startDate);
    endDate = moment(endDate);
    var dates = [],
        end = endDate,
        diff = endDate.diff(startDate, 'days');
    if(!startDate.isValid() || !endDate.isValid() || diff <= 0) return;
    for(var i = 0; i < diff; i++) {
        if(i == 0 && lastDate) {
            dates.push(end.subtract(0,'d').format(dateFormat));
            continue;
        }
        dates.push(end.subtract(1,'d').format(dateFormat));
    }
    return dates;
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
window.SearchQuery = function SearchQuery(query) {
    var pairs = location.search.slice(1).split('&');

    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });
    var params =  JSON.parse(JSON.stringify(result));

    this.checkin = params.checkin;
    this.checkout = params.checkout;
    this.day = params.day;
    this.guest = params.guest;
    this.lat = params.lat;
    this.lng = params.lng;
    this.login = params.login;
    this.stringfiy = function(fullUrl = false) {
        const obj = this;
        return (fullUrl ? window.location.protocol + "//" + window.location.host + window.location.pathname : '' ) + '?'+Object.keys(obj).reduce(function(a,k){
            if(k != 'stringfiy') a.push(k+'='+encodeURIComponent(obj[k]));return a
        },[]).join('&');
    }
    Object.assign(this,query);

};


//Char Converter
String.prototype.turkishToLower = function(){
  var string = this;

  var letters = { "İ": "i", "I": "i", "Ş": "s", "Ğ": "g", "Ü": "u", "Ö": "o", "Ç": "c","i": "i","ş": "s","ğ": "g","ü": "u", "ö": "o","ç": "c", "ı": "i" };
  string = string.replace(/(([İIŞĞÜÇÖiışğüçö]))/g, function(letter){ return letters[letter]; })
  return string.toLowerCase();
};

//get query parameter by name
String.prototype.getParameterByName = function(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec('?' + this);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
String.prototype.clearHtml = function() {
  return this.replace(/(<([^>]+)>)/ig, "").trim();
};
String.prototype.toQueryStrObj = function () {
    var pairs = this.slice(1).split('&');

    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });
    return JSON.parse(JSON.stringify(result));
};

//Array prototype
Array.prototype._advertFilter = function(filter_option) {
    var advertlist = this;
    var datem = false;
  _.each(advertlist, function(advert, key) {

    //visitor
    if (filter_option.hasOwnProperty('visitor')) { if (parseInt(advert.properties.visitor) < parseInt(filter_option.visitor)) Object.assign(advert, {deleted : true});}

    //beds
    if (filter_option.hasOwnProperty('beds')) { if (parseInt(advert.properties.beds) < parseInt(filter_option.beds)) Object.assign(advert, {deleted : true});}

    //room
    if (filter_option.hasOwnProperty('room')) { if (parseInt(advert.properties.room) < parseInt(filter_option.room)) Object.assign(advert, {deleted : true});}

    //advert type
    if(filter_option.hasOwnProperty('advert_type_id') && filter_option.advert_type_id > 0 ) {
     if (parseInt(advert.advert_type.id) !=  parseInt(filter_option.advert_type_id)) Object.assign(advert, {deleted : true});
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
       if ( parseInt(advert.min_layover) > parseInt(moment(filter_option.checkout).diff(moment(filter_option.checkin),'day'))  ) Object.assign(advert, {deleted : true});
     }

    //available date
    if ((filter_option.hasOwnProperty('checkin') && filter_option.hasOwnProperty('checkout')) && advert.available_date.length > 0) {
        _.each(advert.available_date, function(available_date, key) {
          if(!datem) {
            var startDate = new Date(moment(available_date.from_date)),
            endDate   = new Date(moment(available_date.to_date)),
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
      //unavailable date
      if ((filter_option.hasOwnProperty('checkin') && filter_option.hasOwnProperty('checkout')) && advert.unavaiable_date.length > 0) {
          for (var d = new Date(filter_option.checkin); d <= new Date(filter_option.checkout); d.setDate(d.getDate() + 1)) {
           if(advert.unavaiable_date.filter(uad => uad.day == d.getDate() && uad.month == d.getMonth() +1 && uad.year == d.getFullYear()).length > 0) {
                Object.assign(advert, {deleted : true})
           }
          }
      }
  });
  _.remove(advertlist, {deleted:  true})
};

