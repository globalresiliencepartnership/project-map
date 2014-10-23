/*global GPR, Backbone*/

GPR.Collections = GPR.Collections || {};

(function () {
    'use strict';

    GPR.Collections.Countries = Backbone.Collection.extend({
        url: '/grp-map/data/country_level_list.geojson',

        marker: {
            radius: 15,
            weight: 4,
            color: '#DEEBF7',
            opacity: 0.7,
            fillColor: '#4292C5',
            fillOpacity: 0.7
        },

        initialize: function() {
            rendered: false;
        },

        query: function () {
            var that = this;
            this.fetch({
                success: function(collection, response, options) {
                    that.response = response;
                    that.trigger('loaded');
                }
            })
        }

    });

})();
