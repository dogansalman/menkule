   function customMarker(latlng, map, args) {
        this.latlng = latlng;
        this.args = args;
        this.setMap(map);
    }

    customMarker.prototype = new google.maps.OverlayView();

    customMarker.prototype.draw = function() {

        var args = this.args;

        var self = this;

        var div = this.div;

        if (!div) {

            div = this.div = document.createElement('div');
            if(!this.args.peopleMarker) div.innerHTML = args.price + " TL";
            div.className = this.args.peopleMarker ? "people-marker" :"advert-marker"
            if (typeof(self.args.marker_id) !== 'undefined') {
                div.dataset.marker_id = self.args.marker_id;
            }
            if(!this.args.peopleMarker) {
                google.maps.event.addDomListener(div, "click", function(event) {
                    var _e = new $.Event('mrk.map');
                    _e['advert'] = args
                    $(this).trigger(_e, "mrk.map");
                    if (_e.isDefaultPrevented()) return;
                });
            }


            var panes = this.getPanes();
            panes.overlayImage.appendChild(div);
        }

        var point = this.getProjection().fromLatLngToDivPixel(this.latlng);

        if (point) {
            div.style.left = (point.x - 10) + 'px';
            div.style.top = (point.y - 20) + 'px';
        }
    };

    customMarker.prototype.remove = function() {
        if (this.div) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
        }
    };

    customMarker.prototype.getPosition = function() {
        return this.latlng;
    };

    export default customMarker