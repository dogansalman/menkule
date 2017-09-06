import mapStyle from './configs/map-config';

/*
Properties
 */
let map = null;
let markers = [];
let circles = [];
let peopleMarker = null;

/*
 Map icon
 */
const image = {
  url: '/assets/mappin.png',
  size: new google.maps.Size(32, 32),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(0, 32)
};

/*
 Create map
 */
const styledMap = new google.maps.StyledMapType(mapStyle, {
  name: "Styled Map"
});


/*/
 Add marker in maps
 */
$.fn.addMarker = function (location,options) {

  options = Object.assign({
    advert_id: null,
    position: location,
    map: this.Map(),
    draggable: false,
    icon: image
  }, options || {});

  var marker = new google.maps.Marker({
    options
  });
  this.MapMarkers().push(marker);
};

/*
 add advert marker to map
 */
$.fn.addAdvertToMap = function (location,options) {
  var advertmarker = new customMarker(
    new google.maps.LatLng(location.lat,location.lng),
    this.Map(),
    {
      advert_id: options.advert_id,
      price: options.price
    }
  );
  this.MapMarkers().push(advertmarker);
}

$.fn.AddPeopleMarker = function (location) {
  if (typeof peopleMarker != 'undefined') peopleMarker.setMap(null);
  peopleMarker = new customMarker(
    new google.maps.LatLng(location.lat,location.lng),
    this.Map(),
    {
      peopleMarker:true
    }
  );
}
//get marker locations
$.fn.getLocationMarker = function () {
  return { 'lat': this.MapMarkers()[0].getPosition().lat(), 'lng': this.MapMarkers()[0].getPosition().lng() };
};

// Return markers
$.fn.getMarkers = function() {
  return this.MapMarkers();
};
//Return map center codinates
$.fn.getMapCenterCordinate = function() {
  return this.Map().getCenter();
};


//Pan to Marker
$.fn.panToMarker = function(marker) {
  this.Map().panTo(marker.getPosition());
};

//Clear markers
$.fn.clearMarkers = function () {
  return new Promise(resolve => {
    if (typeof $(this).MapMarkers() != 'undefined') $(this).MapMarkers().forEach(m => m.setMap(null));
    $(this).MapMarkers([]);
    resolve();
  })
};

// Center location map
$.fn.centerTo = function (location) {
  this.Map().setCenter(new google.maps.LatLng(location.lat, location.lng));
  return this;
};

//Add circle to map
$.fn.addCircle = function (latlng) {
  circles.forEach(function(c) { c.setMap(null);});
  var circle = new MapCircleOverlay(
    new google.maps.LatLng(parseFloat(latlng.lat), parseFloat(latlng.lng)),
    4, 1, "#65C3F9", 0.8,  "#e2e2e2", 0.35
  );
  circle.setMap(this.Map());
  circles.push(circle);
};

// Set zoom level
$.fn.zoom = function (zoom){
  this.Map().setZoom(parseInt(zoom, 10));
  return this;
};

// Get zoom level
$.fn.getZoom = function () {
  return this.Map().getZoom();
};

var _valFn = $.fn.val;
$.fn.val = function () {
  if (this.Map()) return this.MapMarkers().length > 0 ? this.MapMarkers().map(m => new Point(this.getZoom(), m)) : null;
  return _valFn.apply(this, arguments);
};

$.fn.onMap = function (name, cb) {
  if (this.Map()) return this.Map().addListener(name, cb);
};

// Create Map
$.fn.createMap = function(options) {
  var el = this.toArray()[0];
  if (!el) return;



  options = Object.assign({
    zoom: 6,
    streetViewControl: false,
    disableDefaultUI: true,
    suppressInfoWindows: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    infoWindow: function(){},
    marker: true,
    scroll:false
  }, options || {});

  //fix scroll with css
  if(options.scroll) {
    $(el).addClass('map-disable');
    $(el).parent()
      .click(function() { $(el).addClass('active') })
      .mouseleave(function() { $(el).removeClass('active') });
  }

  return new Promise((resolve) => {
    var map = new google.maps.Map(el, options);
    map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');

    if (typeof options.infoWindow == "function") google.maps.InfoWindow.prototype.set = options.infoWindow;
    $(el).Map(map);
    $(el).MapMarkers([]);

    map.addListener('idle', (e) => {
      this.trigger('ready.map');
      resolve(e);
    });

    map.addListener('click', (e) => {
      var location = e.latLng;
      var _e = new $.Event('clk.map');
      _e['location'] = location;
      this.trigger(_e);
      if (_e.isDefaultPrevented()) return;
    });


    if (options.marker) {
      $(el).onMap('click', (e) => {
        var location = e.latLng;
        var _e = new $.Event('pin.map');
        _e['location'] = location;
        this.trigger(_e);
        if (_e.isDefaultPrevented()) return;
        this.addMarker(e.latLng);
      });
    }

  });
};

$.fn.Map = function(map) {
  if (map) this.data("map", map);
  return this.data("map");
};

$.fn.MapMarkers = function(markers) {
  if (markers) this.data("markers", markers);
  return this.data("markers");
};


/*/
 Constructer
 */
function Gmap() {
}


/*
 Get maps location zoom
 */
Gmap.prototype.getCurrentZoom = function () {
  return new Promise(resolve => {
    resolve(map.getZoom());
  })
};

/*
 Add Location
 */
Gmap.prototype.getMyLocation = function () {
  return new Promise(function (resolve, reject)  {
    navigator.geolocation.getCurrentPosition(function (success) {
      resolve(success.coords);
    }, function (failure) {
      reject(failure);
    });
  })
};

/*
 Get city name with cordinate
 */
Gmap.prototype.getCityName = function (latitude, longitude) {
  return new Promise(function (resolve, reject) {
    var cities = {};
    var request = new XMLHttpRequest();
    var method = 'GET';
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&sensor=true';
    var async = true;
    request.open(method, url, async);
    request.onreadystatechange = function () {
      if (request.readyState == 4) {
        if (request.status == 200) {
          var data = JSON.parse(request.responseText);
          for (let i = 0; i < data.results[0].address_components.length; i++) {
            for (let j = 0; j < data.results[0].address_components[i].types.length; j++) {
              if (data.results[0].address_components[i].types[j] == "administrative_area_level_2") {
                Object.assign(cities,{town: data.results[0].address_components[i].long_name.replace("Merkez", "").trim()})
              }
              if (data.results[0].address_components[i].types[j] == "administrative_area_level_1") {
                Object.assign(cities,{city: data.results[0].address_components[i].long_name.replace("Merkez", "").trim()})
              }
            }
          }
          resolve(cities);
        }
        else {
          reject(request.status);
        }
      }
    };
    request.send();
  });
};


/*
 get city cordinate
 */
Gmap.prototype.getLatLgn = function (city) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();
    var method = 'GET';
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(city);
    var async = true;
    request.open(method, url, async);
    request.onreadystatechange = function () {
      if (request.readyState == 4) {
        if (request.status == 200) {
          var data = JSON.parse(request.responseText);
          resolve(data.results[0].geometry.location);
        }
        else {
          reject(request.status);
        }
      }
    };
    request.send();
  });
}
/*/
 get city location detail
 */
Gmap.prototype.getLocationViewport = function (city) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();
    var method = 'GET';
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(city);
    var async = true;
    request.open(method, url, async);
    request.onreadystatechange = function () {
      if (request.readyState == 4) {
        if (request.status == 200) {
          var data = JSON.parse(request.responseText);
          resolve({'lat': data.results[0].geometry.viewport.northeast.lat, 'lng': data.results[0].geometry.viewport.northeast.lng });
        }
        else {
          reject(request.status);
        }
      }
    };
    request.send();
  });
}

export default Gmap