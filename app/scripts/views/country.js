/*global GPR, Backbone*/

GPR.Views = GPR.Views || {};

(function () {
    'use strict';

    GPR.Views.Country = Backbone.View.extend({

        initialize: function () {
            this.loaded = false
            this.zoomLimit = 5;
        },

        render: function() {
            if (typeof this.layer != 'undefined') {
                this.addLayer();
            }
            else {
                this.listenToOnce(this.collection, 'loaded', this.firstLoad);
                this.collection.query();
            }
        },

        addLayer: function() {
            if (typeof this.layer != 'undefined') {
                this.layer.addTo(GPR.map);
            }
            else {
                this.render();
            }
        },

        removeLayer: function() {
            if (GPR.map.hasLayer(this.layer)) {
                GPR.map.removeLayer(this.layer);
                // GPR.map.off('zoomend');
            }
        },

        firstLoad: function() {
            this.getmap();
            this.layer.addTo(GPR.map);
            this.addZoom();
        },

        addZoom: function() {
            var that = this;
            GPR.map.on('zoomend', function() {
                var zoom = GPR.map.getZoom();
                if (zoom >= that.zoomLimit) {
                    if (GPR.map.hasLayer(that.layer)) {
                        GPR.locationView.addLayer();
                        GPR.countryView.removeLayer();
                    }
                }
                if (zoom < that.zoomLimit && that.loaded) {
                    if (!GPR.map.hasLayer(that.layer)) {
                        GPR.locationView.removeLayer();
                        GPR.countryView.addLayer();
                    }
                }
            });
        },

        removeZoom: function() {
            GPR.map.off('zoomend');
        },

        getmap: function () {
            var popup = new L.Popup({
                className: 'wax-tooltip',
                autoPanPadding: 0,
                closeButton: false,
                offset: L.point(0, -10)
            });
            var closeTooltip;


            var that = this;
            var myLayer = L.geoJson(this.collection.response, {
                pointToLayer: function(feature, latlng) {
                    return  L.circleMarker(latlng, that.collection.marker);
                },
                onEachFeature: function (feature, layer) {
                    layer.on({
                        mousemove: function(e) {
                            var props = e.target.feature.properties;

                            popup.setLatLng(e.latlng);
                            popup.setContent("<div class='section heading'><h2>" + props.country + "</h2>"
                                + "<div class='connections-total'>Budget:<span class='value'>" + props.total_budget + "</span></div></div>"
                                + "<ul class='section connections clearfix'>"
                                + "<li class='seeking'>Projects<span class='value'>" + props.total_projects + "</span></li>"
                                + "<li class='providing'>Partners <span class='value'>" + props.total_partners+ "</span></li>"
                                + "<li class='both'>Locations<span class='value'>" + props.total_locations + "</span></li></ul>");
                            if (!popup._map) popup.openOn(GPR.map);
                            window.clearTimeout(closeTooltip);

                        },
                        mouseout: function(e) {
                            closeTooltip = window.setTimeout(function() {
                                GPR.map.closePopup();
                            }, 100);
                        },
                        click: function(e) {
                            // var projects = new GPR.Views.Projects(e.target.feature.properties);
                            GPR.router.navigate('country/' + e.target.feature.properties.country, {trigger: true});
                        }
                    });
                }
            });
            this.layer = myLayer;

        }
    });
})();

