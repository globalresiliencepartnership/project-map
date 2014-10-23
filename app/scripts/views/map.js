/*global GPR, Backbone*/

GPR.Views = GPR.Views || {};

(function () {
    'use strict';

  GPR.Views.Map = Backbone.View.extend({

        el: '#overlay',

        events: {
            "click a.close"        : "closeModal",
        },

        initialize: function () {

        },

        render: function () {
            L.mapbox.accessToken = this.model.get('token');
            var map = L.mapbox.map('map', this.model.get('base'), { zoomControl: false })
                .setView(this.model.get('view'), this.model.get('zoom'));
            new L.Control.Zoom({ position: 'topright' }).addTo(map);

            var that = this;

            return map;
        },

        addCountry: function () {
            GPR.countryView.addLayer();
        },

        closeModal: function(e) {
            var el = $(e.currentTarget).closest('.modal');
                el.addClass('bye');

            var close = function() {
                el.remove();
            };
            var nested = $(e.currentTarget).attr('data-nested');
            if (nested) {
                close();
            } else {
                setTimeout(close, 500);
                $('#overlay').fadeOut(200);
            }
            window.history.back();
            return false;
        }



    });

})();

