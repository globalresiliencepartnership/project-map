/*global GPR, Backbone*/

GPR.Views = GPR.Views || {};

(function () {
    'use strict';

    GPR.Views.Location = Backbone.View.extend({

        initialize: function () {
        },

        load: function (type) {
            if (typeof this.layer == 'undefined') {
                if (type == 'prepare')
                    this.listenToOnce(this.collection, 'loaded', this.getmap);
                if (type == 'render')
                    this.listenToOnce(this.collection, 'loaded', this.render);
                this.collection.query();
            }
        },

        render: function(type) {
            if (typeof this.layer == 'undefined') {
                this.getmap();
                this.layer.addTo(GPR.map);
            }
        },

        addLayer: function() {
            if (typeof this.layer != 'undefined') {
                this.layer.addTo(GPR.map);
            }
        },

        removeLayer: function() {
            if (GPR.map.hasLayer(this.layer))
                GPR.map.removeLayer(this.layer);
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
            var myLayer = L.geoJson(this.collection.attributes, {
                pointToLayer: function(feature, latlng) {
                    return  L.circleMarker(latlng, that.collection.marker);
                },
                onEachFeature: function (feature, layer) {
                    layer.on({
                        mousemove: function(e) {
                            var props = e.target.feature.properties;

                            popup.setLatLng(e.latlng);
                            popup.setContent("<div class='section heading'><h2>" + props.program_name + "</h2>"
                                + "<div class='connections-total'>" + props.city + ", " + props.country + "</div>"
                                + "<p>Implementer: <strong>" + props.implementer + "</strong></p>"
                                + "<p>2014 Budget: <strong>" + props.fy14_contrib + "</strong></p>"
                                + "<p>" + props.notes + "</p></div>");
                            if (!popup._map) popup.openOn(GPR.map);
                            window.clearTimeout(closeTooltip);

                        },
                        mouseout: function(e) {
                            closeTooltip = window.setTimeout(function() {
                                GPR.map.closePopup();
                            }, 100);
                        },
                        click: function(e) {
                            var projects = new GPR.Views.Projects(e.target.feature.properties);
                            GPR.router.navigate('country/' + e.target.feature.properties.country, {trigger: true});
                        }
                    });
                }
            });
            this.layer = myLayer;
        }
    });
})();

